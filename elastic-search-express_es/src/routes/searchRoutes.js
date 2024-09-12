const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { Client } = require('@elastic/elasticsearch');

const esClient = new Client({ node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200' });

async function initializeElasticsearch() {
  try {
    const indexExists = await esClient.indices.exists({ index: 'products' });
    if (!indexExists.body) {
      await createProductIndex();
    }
    await reindexProducts();
    console.log('Elasticsearch initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Elasticsearch:', error);
  }
}

async function createProductIndex() {
  try {
    await esClient.indices.create({
      index: 'products',
      body: {
        settings: {
          analysis: {
            analyzer: {
              custom_analyzer: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase', 'snowball'],
              },
            },
          },
        },
        mappings: {
          properties: {
            title: { type: 'text', analyzer: 'custom_analyzer' },
            description: { type: 'text', analyzer: 'custom_analyzer' },
            price: { type: 'float' },
            rating: { type: 'float' },
            image: { type: 'keyword' },
          },
        },
      },
    });
  } catch (error) {
    if (error.meta && error.meta.body && error.meta.body.error.type === 'resource_already_exists_exception') {
      console.log('Index already exists, skipping creation');
    } else {
      throw error;
    }
  }
}

// Function to reindex products
async function reindexProducts() {
  const sql = 'SELECT * FROM products';
  return new Promise((resolve, reject) => {
    db.all(sql, [], async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      const body = rows.flatMap((product) => [
        { index: { _index: 'products', _id: product.id } },
        {
          title: product.title,
          description: product.description,
          price: product.price,
          rating: product.rating,
          image: product.image,
        },
      ]);

      const bulkResponse = await esClient.bulk({ refresh: true, body });
      if (bulkResponse.errors) {
        const erroredDocuments = [];
        bulkResponse.items.forEach((action, i) => {
          const operation = Object.keys(action)[0];
          if (action[operation].error) {
            erroredDocuments.push({
              status: action[operation].status,
              error: action[operation].error,
              operation: body[i * 2],
              document: body[i * 2 + 1],
            });
          }
        });
        reject(new Error(`Failed to index some products: ${JSON.stringify(erroredDocuments)}`));
      } else {
        resolve();
      }
    });
  });
}

// Initialize Elasticsearch when the server starts
initializeElasticsearch();

router.get('/es-health', async (req, res) => {
  try {
    const health = await esClient.cluster.health();
    res.json(health);
  } catch (error) {
    console.error('Elasticsearch health check failed:', error);
    res.status(500).json({
      error: 'Elasticsearch health check failed',
      details: error.message,
    });
  }
});

router.get('/search', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const response = await esClient.search({
      index: 'products',
      body: {
        query: {
          multi_match: {
            query: query,
            fields: ['title', 'description'],
            fuzziness: 'AUTO',
            operator: 'or',
            type: 'best_fields',
          },
        },
      },
    });

    const results = response.body.hits.hits.map((hit) => hit._source);
    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed', details: error.message });
  }
});

router.get('/reindex', async (req, res) => {
  try {
    await reindexProducts();
    res.json({ message: 'Products successfully reindexed to Elasticsearch' });
  } catch (error) {
    console.error('Error reindexing products:', error);
    res.status(500).json({ error: 'Failed to reindex products', details: error.message });
  }
});

module.exports = router;
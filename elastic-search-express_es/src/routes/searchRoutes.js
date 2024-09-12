const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { Client } = require('@elastic/elasticsearch');

const esClient = new Client({ node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200' });

async function initializeElasticsearch() {
  try {
    console.log('Attempting to connect to Elasticsearch...');
    const health = await esClient.cluster.health();
    console.log('Elasticsearch health:', health);

    const indexExists = await esClient.indices.exists({ index: 'products' });
    if (!indexExists) {
      console.log('Creating products index...');
      await createProductIndex();
      console.log('Products index created successfully');
    } else {
      console.log('Products index already exists');
    }

    console.log('Reindexing products...');
    await reindexProducts();
    console.log('Products reindexed successfully');

    console.log('Elasticsearch initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Elasticsearch:', error);
  }
}

async function createProductIndex() {
  await esClient.indices.create({
    index: 'products',
    body: {
      settings: {
        analysis: {
          filter: {
            synonym_filter: {
              type: 'synonym',
              synonyms: [
                "mp, MP, mega pixels, megapixels, mega pixel, megapixel"  // All synonyms grouped together
              ]
            },
            snowball_filter: {
              type: 'snowball',
              language: 'English'
            }
          },
          analyzer: {
            custom_analyzer: {
              type: 'custom',
              tokenizer: 'standard',
              filter: ['lowercase', 'synonym_filter', 'snowball_filter'],  // Include synonym filter
            },
          },
        },
      },
      mappings: {
        properties: {
          id: { type: 'integer' },
          title: { type: 'text', analyzer: 'custom_analyzer' },
          description: { type: 'text', analyzer: 'custom_analyzer' },
          price: { type: 'float' },
          rating: { type: 'float' },
          image: { type: 'keyword' },
        },
      },
    },
  });
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

      // Delete existing index
      try {
        await esClient.indices.delete({ index: 'products' });
      } catch (error) {
        console.log('Index does not exist, creating a new one');
      }

      // Recreate the index
      await createProductIndex();

      const body = rows.flatMap((product) => [
        { index: { _index: 'products', _id: product.id.toString() } },
        {
          id: product.id,
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

router.get('/check-sqlite', (req, res) => {
  const sql = 'SELECT * FROM products';
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Failed to retrieve products from SQLite' });
      return;
    }
    res.json(rows);
  });
});

router.get('/search', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    console.log('Searching for:', query);
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
        sort: [
          {
            rating: {
              order: "desc"
            }
          }
        ]
      },
    });

    console.log('Elasticsearch response:', JSON.stringify(response, null, 2));

    if (!response || !response.hits || !response.hits.hits) {
      console.error('Unexpected Elasticsearch response structure:', response);
      return res.status(500).json({ error: 'Unexpected search result structure' });
    }

    const results = response.hits.hits.map((hit) => ({
      id: hit._source.id,
      ...hit._source
    }));
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
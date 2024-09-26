const express = require('express');
const router = express.Router();
const db = require('../db/database'); // SQLite database connection
const { Client } = require('@elastic/elasticsearch'); // Elasticsearch client

// Create an Elasticsearch client
const esClient = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
});

// Function to initialize Elasticsearch
async function initializeElasticsearch() {
  try {
    console.log('Attempting to connect to Elasticsearch...');
    // Check Elasticsearch cluster health
    const health = await esClient.cluster.health();
    console.log('Elasticsearch health:', health);

    // Check if 'products' index exists
    const indexExists = await esClient.indices.exists({ index: 'products' });
    if (!indexExists) {
      console.log('Creating products index...');
      await createProductIndex(); // Create index if it doesn't exist
      console.log('Products index created successfully');
    } else {
      console.log('Products index already exists');
    }

    console.log('Reindexing products...');
    await reindexProducts(); // Reindex products from the database
    console.log('Products reindexed successfully');

    console.log('Elasticsearch initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Elasticsearch:', error);
  }
}

// Function to create the 'products' index with custom settings and mappings
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
                '20mp, 20 mega pixels, 20 megapixels, 20 mega pixel, 20mp',
              ],
            },
            // The snowball_filter in Elasticsearch is a type of text analysis filter that applies the Snowball
            // stemming algorithm to reduce words to their base or root form
            // For example,
            // the words "running," "runs," and "ran" would be reduced to their root form "run."
            snowball_filter: {
              type: 'snowball',
              language: 'English', // Language for snowball stemming
            },
          },
          analyzer: {
            custom_analyzer: {
              type: 'custom',
              tokenizer: 'standard',
              filter: ['lowercase', 'synonym_filter', 'snowball_filter'], // Custom analyzer configuration
            },
          },
        },
      },
      mappings: {
        properties: {
          id: { type: 'integer' }, // Product ID field
          title: { type: 'text', analyzer: 'custom_analyzer' }, // Title field with custom analyzer
          description: { type: 'text', analyzer: 'custom_analyzer' }, // Description field with custom analyzer
          price: { type: 'float' }, // Price field
          rating: { type: 'float' }, // Rating field
          image: { type: 'keyword' }, // Image URL field
        },
      },
    },
  });
}

// Function to reindex products from SQLite database to Elasticsearch
async function reindexProducts() {
  const sql = 'SELECT * FROM products';
  return new Promise((resolve, reject) => {
    db.all(sql, [], async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      // Delete existing 'products' index
      try {
        await esClient.indices.delete({ index: 'products' });
      } catch (error) {
        console.log('Index does not exist, creating a new one');
      }

      // Recreate the index
      await createProductIndex();

      // Prepare bulk request body for Elasticsearch
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

      // Execute bulk request to index documents
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
        reject(
          new Error(
            `Failed to index some products: ${JSON.stringify(erroredDocuments)}`
          )
        );
      } else {
        resolve();
      }
    });
  });
}

// Initialize Elasticsearch when the server starts
initializeElasticsearch();

// Route to check Elasticsearch cluster health
router.get('/es-health', async (req, res) => {
  try {
    const health = await esClient.cluster.health(); // Get Elasticsearch health status
    res.json(health);
  } catch (error) {
    console.error('Elasticsearch health check failed:', error);
    res.status(500).json({
      error: 'Elasticsearch health check failed',
      details: error.message,
    });
  }
});

// Route to check SQLite database data
router.get('/check-sqlite', (req, res) => {
  const sql = 'SELECT * FROM products';
  db.all(sql, [], (err, rows) => {
    if (err) {
      res
        .status(500)
        .json({ error: 'Failed to retrieve products from SQLite' });
      return;
    }
    res.json(rows);
  });
});

// Route to search products in Elasticsearch
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
          bool: {
            should: [
              {
                match: {
                  title: {
                    query: query,
                    fuzziness: 'AUTO',
                    analyzer: 'custom_analyzer', // Use custom analyzer
                  },
                },
              },
              {
                match: {
                  description: {
                    query: query,
                    fuzziness: 'AUTO',
                    analyzer: 'custom_analyzer', // Use custom analyzer
                  },
                },
              },
            ],
          },
        },
        sort: [
          {
            rating: {
              order: 'desc',
            },
          },
        ],
      },
    });

    console.log('Elasticsearch response:', JSON.stringify(response, null, 2));

    if (!response || !response.hits || !response.hits.hits) {
      console.error('Unexpected Elasticsearch response structure:', response);
      return res
        .status(500)
        .json({ error: 'Unexpected search result structure' });
    }

    // Map search results to a simpler format
    const results = response.hits.hits.map((hit) => ({
      id: hit._source.id,
      ...hit._source,
    }));
    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed', details: error.message });
  }
});

// Route to reindex products from SQLite to Elasticsearch
router.get('/reindex', async (req, res) => {
  try {
    await reindexProducts(); // Reindex products
    res.json({ message: 'Products successfully reindexed to Elasticsearch' });
  } catch (error) {
    console.error('Error reindexing products:', error);
    res
      .status(500)
      .json({ error: 'Failed to reindex products', details: error.message });
  }
});

module.exports = router; // Export the router

// src/routes/searchRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db/database');



// Endpoint to search products in Elasticsearch
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

    console.log(
      'Full Elasticsearch response:',
      JSON.stringify(response, null, 2)
    );

    const results = response.hits.hits.map((hit) => hit._source);

    if (results.length === 0) {
      console.warn('No documents found for query:', query);
    }

    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed', details: error.message });
  }
});

// Endpoint to reindex products into Elasticsearch
router.get('/reindex', async (req, res) => {
  try {
    // Fetch all products from the SQLite database
    const sql = 'SELECT * FROM products';
    db.all(sql, [], async (err, rows) => {
      if (err) {
        console.error(err.message);
        return res
          .status(500)
          .json({ error: 'Failed to fetch products from database' });
      }

      // Delete the existing index if it exists
      try {
        await esClient.indices.delete({ index: 'products' });
      } catch (error) {
        if (
          error.meta &&
          error.meta.body &&
          error.meta.body.error &&
          error.meta.body.error.type !== 'index_not_found_exception'
        ) {
          console.error('Failed to delete index:', error);
          return res
            .status(500)
            .json({ error: 'Failed to delete existing index' });
        }
      }

      // Create a new index for products
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
              title: {
                type: 'text',
                analyzer: 'custom_analyzer',
              },
              description: {
                type: 'text',
                analyzer: 'custom_analyzer',
              },
              price: { type: 'float' },
              rating: { type: 'float' },
              image: { type: 'keyword' },
            },
          },
        },
      });

      // Index each product into Elasticsearch
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

      // Correctly handle the bulk indexing response
      const bulkResponse = await esClient.bulk({
        refresh: true,
        body,
      });

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
        console.error('Indexing errors:', erroredDocuments);
        return res.status(500).json({
          error: 'Failed to index some products',
          details: erroredDocuments,
        });
      }

      res.json({ message: 'Products successfully reindexed to Elasticsearch' });
    });
  } catch (error) {
    console.error('Error reindexing products:', error);
    res.status(500).json({ error: 'Failed to reindex products' });
  }
});

module.exports = router;

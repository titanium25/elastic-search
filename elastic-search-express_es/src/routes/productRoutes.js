// src/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/products - Fetch all products
router.get('/products', (req, res) => {
  const sql = 'SELECT * FROM products';
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Failed to retrieve products' });
      return;
    }
    res.json(rows);
  });
});

module.exports = router;

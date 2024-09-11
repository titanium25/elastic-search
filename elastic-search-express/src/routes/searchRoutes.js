// src/routes/searchRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/search?query=productTitle
router.get('/search', (req, res) => {
  const searchTerm = req.query.query;

  if (!searchTerm) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  const sql = `SELECT * FROM products 
  WHERE LOWER(title) LIKE LOWER(?) 
  OR LOWER(description) LIKE LOWER(?) 
  ORDER BY rating DESC`;
  
  const params = [`%${searchTerm}%`, `%${searchTerm}%`];

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Database error' });
      return;
    }
    res.json(rows);
  });
});

module.exports = router;

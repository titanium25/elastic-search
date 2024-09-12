// src/app.js
'use strict'; // Add strict mode

const express = require('express');
const cors = require('cors'); // Import cors
const searchRoutes = require('./routes/searchRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS for all routes

// Routes
app.use('/api', searchRoutes);
app.use('/api', productRoutes);

module.exports = app;

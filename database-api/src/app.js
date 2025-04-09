const express = require('express');
const cors = require('cors');
const config = require('./config');
const db = require('./db');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const sqlRoutes = require('./routes/sql');
const collectionRoutes = require('./routes/collections');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// API Routes
app.use('/sql', sqlRoutes);
app.use('/collections', collectionRoutes);

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    version: '1.0.0',
    environment: config.app.environment,
    timestamp: new Date().toISOString()
  });
});

// Database connection test endpoint
app.get('/db-test', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    
    res.status(200).json({ 
      status: 'Database connection successful', 
      timestamp: result.rows[0].now 
    });
  } catch (error) {
    console.error('Database connection error:', error);
    
    res.status(500).json({ 
      status: 'Database connection failed', 
      error: error.message 
    });
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    status: 'error', 
    message: `Endpoint not found: ${req.method} ${req.originalUrl}` 
  });
});

// Error handler
app.use(errorHandler);

// Export app for testing
module.exports = app; 
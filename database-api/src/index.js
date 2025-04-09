require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connect: pgConnect } = require('./services/postgres');
const { connect: natsConnect } = require('./services/nats');
const sqlRoutes = require('./routes/sql');
const collectionsRoutes = require('./routes/collections');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/sql', sqlRoutes);
app.use('/collections', collectionsRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: true,
    message: err.message || 'An unexpected error occurred'
  });
});

async function start() {
  try {
    // Connect to PostgreSQL
    await pgConnect();
    console.log('Connected to PostgreSQL');
    
    // Connect to NATS
    await natsConnect();
    console.log('Connected to NATS');
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start(); 
const app = require('./app');
const config = require('./config');
const db = require('./db');
const nats = require('./services/nats');

/**
 * Start the application server
 */
async function startServer() {
  try {
    // Initialize database
    await db.query(`
      CREATE TABLE IF NOT EXISTS collections (
        id UUID PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        schema JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Database initialized successfully');
    
    // Try to connect to NATS if not in test mode
    if (config.app.environment !== 'test') {
      try {
        await nats.connect();
        console.log('Connected to NATS');
      } catch (error) {
        console.warn('Failed to connect to NATS. Running without events:', error.message);
      }
    }
    
    // Start HTTP server
    const server = app.listen(config.app.port, () => {
      console.log(`Server running on port ${config.app.port} in ${config.app.environment} mode`);
      console.log(`Database: ${config.database.host}:${config.database.port}/${config.database.name}`);
    });
    
    // Handle graceful shutdown
    process.on('SIGTERM', () => gracefulShutdown(server));
    process.on('SIGINT', () => gracefulShutdown(server));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * Gracefully shut down the server
 */
async function gracefulShutdown(server) {
  console.log('Shutting down gracefully...');
  
  server.close(async () => {
    console.log('HTTP server closed');
    
    try {
      // Close database connection
      await db.pool.end();
      console.log('Database connections closed');
      
      // Close NATS connection if it exists
      if (nats.getConnection()) {
        await nats.getConnection().drain();
        console.log('NATS connection closed');
      }
      
      console.log('Shutdown complete');
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  });
}

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = { startServer }; 
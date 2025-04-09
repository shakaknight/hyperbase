/**
 * Application configuration
 * Values are read from environment variables with sensible defaults
 */

require('dotenv').config();

module.exports = {
  app: {
    environment: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10)
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'hyperbase',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    // Pool configuration
    poolMax: parseInt(process.env.DB_POOL_MAX || '20', 10),
    idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000', 10)
  }
}; 
/**
 * Database connection module
 */

const { Pool } = require('pg');
const config = require('../config');

// Create connection pool
const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
  max: config.database.poolMax,
  idleTimeoutMillis: config.database.idleTimeout,
  connectionTimeoutMillis: config.database.connectionTimeout
});

// Log connection events
pool.on('connect', () => {
  console.log('New client connected to database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Execute SQL query with optional parameters
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise} Query result
 */
const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  
  console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
};

/**
 * Get a dedicated client from the pool
 * @returns {Object} Client and release function
 */
const getClient = async () => {
  const client = await pool.connect();
  const release = client.release;
  
  // Override release method to log duration
  client.release = () => {
    console.log('Client returned to pool');
    release.apply(client);
  };
  
  return client;
};

module.exports = {
  query,
  getClient,
  pool
}; 
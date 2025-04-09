const { Pool } = require('pg');

let pool;

/**
 * Connect to PostgreSQL database
 */
async function connect() {
  try {
    pool = new Pool({
      connectionString: process.env.DB_URL,
    });
    
    // Test the connection
    await pool.query('SELECT NOW()');
    return pool;
  } catch (error) {
    console.error('PostgreSQL connection error:', error);
    throw error;
  }
}

/**
 * Execute a SQL query
 * @param {string} query - SQL query to execute
 * @param {Array} params - Query parameters
 */
async function executeQuery(query, params = []) {
  if (!pool) {
    throw new Error('Database connection not established');
  }
  
  try {
    const result = await pool.query(query, params);
    return result;
  } catch (error) {
    console.error('Query execution error:', error);
    throw error;
  }
}

module.exports = {
  connect,
  executeQuery,
  getPool: () => pool
}; 
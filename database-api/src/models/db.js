const { Pool } = require('pg');
const config = require('../config');

// Create a connection pool
const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection
});

// The pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: async () => {
    const client = await pool.connect();
    const release = client.release;
    // Override the standard release method to add logging
    client.release = () => {
      release.apply(client);
    };
    return client;
  },
  pool
}; 
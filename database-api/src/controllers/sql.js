const { pool } = require('../models/db');

/**
 * Execute a SQL query
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.executeQuery = async (req, res) => {
  try {
    const { query, params = [] } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(query, params);
      res.json({
        rows: result.rows,
        rowCount: result.rowCount,
        fields: result.fields?.map(field => ({
          name: field.name,
          dataTypeID: field.dataTypeID
        }))
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Execute a transaction with multiple SQL statements
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.executeTransaction = async (req, res) => {
  try {
    const { statements } = req.body;

    if (!statements || !Array.isArray(statements) || statements.length === 0) {
      return res.status(400).json({ error: 'Valid statements array is required' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const results = [];
      for (const statement of statements) {
        const { query, params = [] } = statement;
        if (!query) {
          throw new Error('Each statement must include a query');
        }
        
        const result = await client.query(query, params);
        results.push({
          rows: result.rows,
          rowCount: result.rowCount
        });
      }
      
      await client.query('COMMIT');
      res.json({ results });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error executing transaction:', error);
    res.status(500).json({ error: error.message });
  }
}; 
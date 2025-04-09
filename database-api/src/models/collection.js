/**
 * Collection model for database operations
 */

const { v4: uuidv4 } = require('uuid');
const db = require('../db');

/**
 * Get all collections
 * @returns {Promise<Array>} Collections array
 */
const getAllCollections = async () => {
  const result = await db.query('SELECT * FROM collections ORDER BY name');
  return result.rows;
};

/**
 * Get a collection by ID
 * @param {string} id - Collection ID
 * @returns {Promise<Object>} Collection object
 */
const getCollectionById = async (id) => {
  const result = await db.query('SELECT * FROM collections WHERE id = $1', [id]);
  return result.rows[0];
};

/**
 * Create a new collection with a table
 * @param {Object} data - Collection data
 * @returns {Promise<Object>} Created collection
 */
const createCollection = async (data) => {
  const { name, schema = {} } = data;
  const id = uuidv4();
  
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    
    // Insert into collections table
    const result = await client.query(
      'INSERT INTO collections (id, name, schema) VALUES ($1, $2, $3) RETURNING *',
      [id, name, schema]
    );
    
    // Create table for collection documents
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents_${id.replace(/-/g, '_')} (
        id UUID PRIMARY KEY,
        data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create index on JSONB data
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_documents_${id.replace(/-/g, '_')}_data 
      ON documents_${id.replace(/-/g, '_')} USING GIN (data)
    `);
    
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Update a collection
 * @param {string} id - Collection ID
 * @param {Object} data - Updated collection data
 * @returns {Promise<Object>} Updated collection
 */
const updateCollection = async (id, data) => {
  const { name, schema = {} } = data;
  
  const result = await db.query(
    'UPDATE collections SET name = $1, schema = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
    [name, schema, id]
  );
  
  return result.rows[0];
};

/**
 * Delete a collection and its table
 * @param {string} id - Collection ID
 * @returns {Promise<boolean>} Success status
 */
const deleteCollection = async (id) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    
    // Drop the documents table for this collection
    await client.query(`DROP TABLE IF EXISTS documents_${id.replace(/-/g, '_')}`);
    
    // Delete from collections table
    await client.query('DELETE FROM collections WHERE id = $1', [id]);
    
    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  getAllCollections,
  getCollectionById,
  createCollection,
  updateCollection,
  deleteCollection
}; 
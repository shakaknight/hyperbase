const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const nats = require('../services/nats');

/**
 * Get all collections
 */
exports.getAllCollections = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM collections ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new collection
 */
exports.createCollection = async (req, res, next) => {
  try {
    const { name, schema } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Collection name is required' });
    }
    
    // Check if collection already exists
    const existingResult = await db.query('SELECT * FROM collections WHERE name = $1', [name]);
    if (existingResult.rows.length > 0) {
      return res.status(409).json({ error: 'Collection already exists' });
    }
    
    const id = uuidv4();
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Create collection record
      const result = await client.query(
        'INSERT INTO collections (id, name, schema) VALUES ($1, $2, $3) RETURNING *',
        [id, name, schema || {}]
      );
      
      // Create documents table for this collection
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
      
      // Publish event
      nats.publish('collection.created', {
        id,
        name,
        schema: schema || {}
      });
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get a collection by ID
 */
exports.getCollectionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('SELECT * FROM collections WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a collection
 */
exports.updateCollection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, schema } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Collection name is required' });
    }
    
    // Check if collection exists
    const existingResult = await db.query('SELECT * FROM collections WHERE id = $1', [id]);
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    // Update collection
    const result = await db.query(
      'UPDATE collections SET name = $1, schema = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [name, schema || {}, id]
    );
    
    // Publish event
    nats.publish('collection.updated', result.rows[0]);
    
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a collection
 */
exports.deleteCollection = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if collection exists
    const existingResult = await db.query('SELECT * FROM collections WHERE id = $1', [id]);
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Drop the documents table for this collection
      await client.query(`DROP TABLE IF EXISTS documents_${id.replace(/-/g, '_')}`);
      
      // Delete the collection record
      await client.query('DELETE FROM collections WHERE id = $1', [id]);
      
      await client.query('COMMIT');
      
      // Publish event
      nats.publish('collection.deleted', existingResult.rows[0]);
      
      res.status(204).send();
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get all documents in a collection
 */
exports.getAllDocuments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 100, offset = 0, query } = req.query;
    
    // Check if collection exists
    const collectionResult = await db.query('SELECT * FROM collections WHERE id = $1', [id]);
    if (collectionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    let sqlQuery = `SELECT * FROM documents_${id.replace(/-/g, '_')}`;
    const params = [];
    
    // Add query filtering if provided
    if (query) {
      try {
        const queryObj = JSON.parse(query);
        if (Object.keys(queryObj).length > 0) {
          const conditions = [];
          let paramIndex = 1;
          
          for (const [key, value] of Object.entries(queryObj)) {
            conditions.push(`data->>'${key}' = $${paramIndex}`);
            params.push(String(value));
            paramIndex++;
          }
          
          sqlQuery += ` WHERE ${conditions.join(' AND ')}`;
        }
      } catch (error) {
        return res.status(400).json({ error: 'Invalid query format' });
      }
    }
    
    // Add pagination
    sqlQuery += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit));
    params.push(Number(offset));
    
    const result = await db.query(sqlQuery, params);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new document in a collection
 */
exports.createDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data } = req.body;
    
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Document data is required and must be an object' });
    }
    
    // Check if collection exists
    const collectionResult = await db.query('SELECT * FROM collections WHERE id = $1', [id]);
    if (collectionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    // Validate against schema if defined
    const schema = collectionResult.rows[0].schema;
    if (schema && Object.keys(schema).length > 0) {
      for (const [field, rules] of Object.entries(schema)) {
        if (rules.required && data[field] === undefined) {
          return res.status(400).json({ error: `Required field '${field}' is missing` });
        }
        
        if (rules.type && data[field] !== undefined) {
          const type = typeof data[field];
          if (
            (rules.type === 'string' && type !== 'string') ||
            (rules.type === 'number' && type !== 'number') ||
            (rules.type === 'boolean' && type !== 'boolean') ||
            (rules.type === 'object' && type !== 'object') ||
            (rules.type === 'array' && !Array.isArray(data[field]))
          ) {
            return res.status(400).json({ error: `Field '${field}' must be of type ${rules.type}` });
          }
        }
      }
    }
    
    const documentId = uuidv4();
    
    // Insert document
    const result = await db.query(
      `INSERT INTO documents_${id.replace(/-/g, '_')} (id, data) 
       VALUES ($1, $2) 
       RETURNING id, data, created_at, updated_at`,
      [documentId, data]
    );
    
    // Publish event
    nats.publish('document.created', {
      id: documentId,
      collection_id: id,
      data
    });
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a document by ID
 */
exports.getDocumentById = async (req, res, next) => {
  try {
    const { id, documentId } = req.params;
    
    // Check if collection exists
    const collectionResult = await db.query('SELECT * FROM collections WHERE id = $1', [id]);
    if (collectionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    // Get document
    const result = await db.query(
      `SELECT * FROM documents_${id.replace(/-/g, '_')} WHERE id = $1`,
      [documentId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a document
 */
exports.updateDocument = async (req, res, next) => {
  try {
    const { id, documentId } = req.params;
    const { data } = req.body;
    
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Document data is required and must be an object' });
    }
    
    // Check if collection exists
    const collectionResult = await db.query('SELECT * FROM collections WHERE id = $1', [id]);
    if (collectionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    // Check if document exists
    const documentResult = await db.query(
      `SELECT * FROM documents_${id.replace(/-/g, '_')} WHERE id = $1`,
      [documentId]
    );
    
    if (documentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Validate against schema if defined
    const schema = collectionResult.rows[0].schema;
    if (schema && Object.keys(schema).length > 0) {
      for (const [field, rules] of Object.entries(schema)) {
        if (rules.required && data[field] === undefined) {
          return res.status(400).json({ error: `Required field '${field}' is missing` });
        }
        
        if (rules.type && data[field] !== undefined) {
          const type = typeof data[field];
          if (
            (rules.type === 'string' && type !== 'string') ||
            (rules.type === 'number' && type !== 'number') ||
            (rules.type === 'boolean' && type !== 'boolean') ||
            (rules.type === 'object' && type !== 'object') ||
            (rules.type === 'array' && !Array.isArray(data[field]))
          ) {
            return res.status(400).json({ error: `Field '${field}' must be of type ${rules.type}` });
          }
        }
      }
    }
    
    // Update document
    const result = await db.query(
      `UPDATE documents_${id.replace(/-/g, '_')} 
       SET data = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING id, data, created_at, updated_at`,
      [data, documentId]
    );
    
    // Publish event
    nats.publish('document.updated', {
      id: documentId,
      collection_id: id,
      data
    });
    
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a document
 */
exports.deleteDocument = async (req, res, next) => {
  try {
    const { id, documentId } = req.params;
    
    // Check if collection exists
    const collectionResult = await db.query('SELECT * FROM collections WHERE id = $1', [id]);
    if (collectionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    // Check if document exists and delete it
    const result = await db.query(
      `DELETE FROM documents_${id.replace(/-/g, '_')} WHERE id = $1 RETURNING *`,
      [documentId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Publish event
    nats.publish('document.deleted', {
      id: documentId,
      collection_id: id
    });
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}; 
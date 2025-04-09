/**
 * Document model for database operations
 */

const { v4: uuidv4 } = require('uuid');
const db = require('../db');

/**
 * Get all documents in a collection
 * @param {string} collectionId - Collection ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Documents array
 */
const getAllDocuments = async (collectionId, options = {}) => {
  const { limit = 100, offset = 0, query = null } = options;
  
  let sqlQuery = `SELECT * FROM documents_${collectionId.replace(/-/g, '_')}`;
  const params = [];
  
  // Add filtering if query provided
  if (query && typeof query === 'object') {
    const conditions = [];
    let paramIndex = 1;
    
    for (const [key, value] of Object.entries(query)) {
      conditions.push(`data->>'${key}' = $${paramIndex}`);
      params.push(String(value));
      paramIndex++;
    }
    
    if (conditions.length > 0) {
      sqlQuery += ` WHERE ${conditions.join(' AND ')}`;
    }
  }
  
  // Add pagination
  sqlQuery += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(Number(limit));
  params.push(Number(offset));
  
  const result = await db.query(sqlQuery, params);
  return result.rows;
};

/**
 * Get a document by ID
 * @param {string} collectionId - Collection ID
 * @param {string} documentId - Document ID
 * @returns {Promise<Object>} Document object
 */
const getDocumentById = async (collectionId, documentId) => {
  const result = await db.query(
    `SELECT * FROM documents_${collectionId.replace(/-/g, '_')} WHERE id = $1`,
    [documentId]
  );
  
  return result.rows[0];
};

/**
 * Create a document
 * @param {string} collectionId - Collection ID
 * @param {Object} data - Document data
 * @returns {Promise<Object>} Created document
 */
const createDocument = async (collectionId, data) => {
  const documentId = uuidv4();
  
  const result = await db.query(
    `INSERT INTO documents_${collectionId.replace(/-/g, '_')} (id, data) 
     VALUES ($1, $2) 
     RETURNING id, data, created_at, updated_at`,
    [documentId, data]
  );
  
  return result.rows[0];
};

/**
 * Update a document
 * @param {string} collectionId - Collection ID
 * @param {string} documentId - Document ID
 * @param {Object} data - Updated document data
 * @returns {Promise<Object>} Updated document
 */
const updateDocument = async (collectionId, documentId, data) => {
  const result = await db.query(
    `UPDATE documents_${collectionId.replace(/-/g, '_')} 
     SET data = $1, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $2 
     RETURNING id, data, created_at, updated_at`,
    [data, documentId]
  );
  
  return result.rows[0];
};

/**
 * Delete a document
 * @param {string} collectionId - Collection ID
 * @param {string} documentId - Document ID
 * @returns {Promise<boolean>} Success status
 */
const deleteDocument = async (collectionId, documentId) => {
  const result = await db.query(
    `DELETE FROM documents_${collectionId.replace(/-/g, '_')} 
     WHERE id = $1 
     RETURNING id`,
    [documentId]
  );
  
  return result.rows.length > 0;
};

/**
 * Validate document against collection schema
 * @param {Object} schema - Collection schema
 * @param {Object} document - Document data
 * @returns {Object} Validation result { valid: boolean, errors: Array }
 */
const validateDocument = (schema, document) => {
  if (!schema || Object.keys(schema).length === 0) {
    return { valid: true, errors: [] };
  }
  
  const errors = [];
  
  for (const [field, rules] of Object.entries(schema)) {
    // Check required fields
    if (rules.required && document[field] === undefined) {
      errors.push(`Required field '${field}' is missing`);
      continue;
    }
    
    // Skip validation if field is not present
    if (document[field] === undefined) {
      continue;
    }
    
    // Type validation
    if (rules.type) {
      const type = typeof document[field];
      
      if (
        (rules.type === 'string' && type !== 'string') ||
        (rules.type === 'number' && type !== 'number') ||
        (rules.type === 'boolean' && type !== 'boolean') ||
        (rules.type === 'object' && type !== 'object') ||
        (rules.type === 'array' && !Array.isArray(document[field]))
      ) {
        errors.push(`Field '${field}' must be of type ${rules.type}`);
      }
    }
    
    // Length validation for strings
    if (rules.type === 'string' && typeof document[field] === 'string') {
      if (rules.minLength && document[field].length < rules.minLength) {
        errors.push(`Field '${field}' must be at least ${rules.minLength} characters long`);
      }
      
      if (rules.maxLength && document[field].length > rules.maxLength) {
        errors.push(`Field '${field}' must be at most ${rules.maxLength} characters long`);
      }
    }
    
    // Range validation for numbers
    if (rules.type === 'number' && typeof document[field] === 'number') {
      if (rules.min !== undefined && document[field] < rules.min) {
        errors.push(`Field '${field}' must be greater than or equal to ${rules.min}`);
      }
      
      if (rules.max !== undefined && document[field] > rules.max) {
        errors.push(`Field '${field}' must be less than or equal to ${rules.max}`);
      }
    }
    
    // Pattern validation for strings
    if (rules.pattern && typeof document[field] === 'string') {
      const regex = new RegExp(rules.pattern);
      if (!regex.test(document[field])) {
        errors.push(`Field '${field}' does not match required pattern`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

module.exports = {
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  validateDocument
}; 
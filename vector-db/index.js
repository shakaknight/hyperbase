const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { connect } = require('nats');
const { v4: uuidv4 } = require('uuid');
// Load environment variables from .env file
require('dotenv').config();

// Initialize Express app
const app = express();
app.use(express.json());
app.use(cors());

// Configure PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.POSTGRES_URI
});

// Connect to NATS event bus if not skipped
let natsConnection;
async function connectToEventBus() {
  // Skip NATS connection if SKIP_NATS is set
  if (process.env.SKIP_NATS === 'true') {
    console.log('NATS connection skipped');
    return;
  }

  try {
    natsConnection = await connect({ 
      servers: process.env.EVENT_BUS_URL 
    });
    console.log('Connected to NATS event bus');
    
    // Subscribe to relevant events
    const subscription = natsConnection.subscribe('vector.events');
    for await (const msg of subscription) {
      const event = JSON.parse(msg.data);
      handleVectorEvent(event);
    }
  } catch (error) {
    console.error('Failed to connect to NATS:', error);
    setTimeout(connectToEventBus, 5000); // Retry connection
  }
}

// Safe publish function that works without NATS
function safePublish(subject, data) {
  if (natsConnection) {
    natsConnection.publish(subject, JSON.stringify(data));
  } else {
    console.log(`Event would be published to ${subject}:`, data);
  }
}

// Handle vector-related events
async function handleVectorEvent(event) {
  switch(event.type) {
    case 'collection.created':
      console.log(`Collection created: ${event.data.name}`);
      break;
    case 'collection.deleted':
      console.log(`Collection deleted: ${event.data.name}`);
      break;
    default:
      console.log(`Unknown event type: ${event.type}`);
  }
}

// Initialize database - simplified version without pgvector
async function initDatabase() {
  const client = await pool.connect();
  try {
    // Create vector_collections table
    await client.query(`
      CREATE TABLE IF NOT EXISTS vector_collections (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        dimensions INTEGER NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create function to automatically update updated_at timestamp
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    // Create trigger for vector_collections
    await client.query(`
      DROP TRIGGER IF EXISTS update_vector_collections_updated_at ON vector_collections;
      CREATE TRIGGER update_vector_collections_updated_at
      BEFORE UPDATE ON vector_collections
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Create simplified vector tables without pgvector
async function createVectorTable(collection) {
  const client = await pool.connect();
  try {
    const tableName = `vector_data_${collection.id.replace(/-/g, '_')}`;
    
    // Create table for vector data - simple JSON array for vectors
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id VARCHAR(36) PRIMARY KEY,
        vector_data JSONB NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create trigger for vector data table
    await client.query(`
      DROP TRIGGER IF EXISTS update_${tableName}_updated_at ON ${tableName};
      CREATE TRIGGER update_${tableName}_updated_at
      BEFORE UPDATE ON ${tableName}
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
    
    // Create index on metadata
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_${tableName}_metadata ON ${tableName} USING GIN (metadata);
    `);
    
    console.log(`Created vector table: ${tableName}`);
  } catch (error) {
    console.error(`Error creating vector table:`, error);
    throw error;
  } finally {
    client.release();
  }
}

// Routes
app.post('/collections', async (req, res) => {
  const { name, description, dimensions, metadata } = req.body;
  
  if (!name || !dimensions) {
    return res.status(400).json({ error: 'Name and dimensions are required' });
  }
  
  const client = await pool.connect();
  try {
    // Check if collection already exists
    const existingCollection = await client.query(
      'SELECT * FROM vector_collections WHERE name = $1',
      [name]
    );
    
    if (existingCollection.rows.length > 0) {
      return res.status(400).json({ error: 'Collection already exists' });
    }
    
    // Create collection
    const id = uuidv4();
    const collection = {
      id,
      name,
      description: description || '',
      dimensions,
      metadata: metadata || {}
    };
    
    await client.query(
      'INSERT INTO vector_collections (id, name, description, dimensions, metadata) VALUES ($1, $2, $3, $4, $5)',
      [collection.id, collection.name, collection.description, collection.dimensions, collection.metadata]
    );
    
    // Create vector table for collection
    await createVectorTable(collection);
    
    // Publish collection.created event
    const event = {
      type: 'collection.created',
      data: {
        id: collection.id,
        name: collection.name
      }
    };
    safePublish('vector.events', event);
    
    res.status(201).json(collection);
  } catch (error) {
    console.error('Error creating collection:', error);
    res.status(500).json({ error: 'Failed to create collection' });
  } finally {
    client.release();
  }
});

app.get('/collections', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vector_collections');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
});

app.get('/collections/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      'SELECT * FROM vector_collections WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching collection:', error);
    res.status(500).json({ error: 'Failed to fetch collection' });
  }
});

app.delete('/collections/:id', async (req, res) => {
  const { id } = req.params;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Get collection
    const result = await client.query(
      'SELECT * FROM vector_collections WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    const collection = result.rows[0];
    
    // Drop vector table
    const tableName = `vector_data_${collection.id.replace(/-/g, '_')}`;
    await client.query(`DROP TABLE IF EXISTS ${tableName}`);
    
    // Delete collection
    await client.query('DELETE FROM vector_collections WHERE id = $1', [id]);
    
    await client.query('COMMIT');
    
    // Publish collection.deleted event
    const event = {
      type: 'collection.deleted',
      data: {
        id: collection.id,
        name: collection.name
      }
    };
    safePublish('vector.events', event);
    
    res.json({ message: 'Collection deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting collection:', error);
    res.status(500).json({ error: 'Failed to delete collection' });
  } finally {
    client.release();
  }
});

app.post('/collections/:id/vectors', async (req, res) => {
  const { id } = req.params;
  const { vector, metadata } = req.body;
  
  if (!vector) {
    return res.status(400).json({ error: 'Vector is required' });
  }
  
  const client = await pool.connect();
  try {
    // Get collection
    const result = await client.query(
      'SELECT * FROM vector_collections WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    const collection = result.rows[0];
    
    // Validate vector dimensions
    if (vector.length !== collection.dimensions) {
      return res.status(400).json({ 
        error: `Vector dimensions do not match collection dimensions (expected ${collection.dimensions}, got ${vector.length})` 
      });
    }
    
    // Insert vector
    const vectorId = uuidv4();
    const tableName = `vector_data_${collection.id.replace(/-/g, '_')}`;
    
    await client.query(
      `INSERT INTO ${tableName} (id, vector_data, metadata) VALUES ($1, $2, $3)`,
      [vectorId, JSON.stringify(vector), metadata || {}]
    );
    
    res.status(201).json({
      id: vectorId,
      metadata: metadata || {}
    });
  } catch (error) {
    console.error('Error inserting vector:', error);
    res.status(500).json({ error: 'Failed to insert vector' });
  } finally {
    client.release();
  }
});

app.get('/collections/:id/vectors', async (req, res) => {
  const { id } = req.params;
  const { limit = 100, offset = 0 } = req.query;
  
  const client = await pool.connect();
  try {
    // Get collection
    const result = await client.query(
      'SELECT * FROM vector_collections WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    const collection = result.rows[0];
    const tableName = `vector_data_${collection.id.replace(/-/g, '_')}`;
    
    // Fetch vectors
    const vectorsResult = await client.query(
      `SELECT id, metadata, created_at, updated_at FROM ${tableName} LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    res.json(vectorsResult.rows);
  } catch (error) {
    console.error('Error fetching vectors:', error);
    res.status(500).json({ error: 'Failed to fetch vectors' });
  } finally {
    client.release();
  }
});

// Simplified vector search - use exact match or metadata filtering
app.post('/collections/:id/search', async (req, res) => {
  const { id } = req.params;
  const { filter, k = 10 } = req.body;
  
  const client = await pool.connect();
  try {
    // Get collection
    const result = await client.query(
      'SELECT * FROM vector_collections WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    const collection = result.rows[0];
    const tableName = `vector_data_${collection.id.replace(/-/g, '_')}`;
    
    // Build SQL query with metadata filter
    let sql = `
      SELECT 
        id,
        metadata,
        created_at,
        updated_at
      FROM ${tableName}
    `;
    
    const queryParams = [];
    let paramIndex = 1;
    
    // Add filter if provided
    if (filter) {
      sql += ` WHERE metadata @> $${paramIndex}::jsonb`;
      queryParams.push(filter);
      paramIndex++;
    }
    
    // Add limit
    sql += ` LIMIT $${paramIndex}`;
    queryParams.push(k);
    
    // Execute query
    const searchResult = await client.query(sql, queryParams);
    
    res.json(searchResult.rows);
  } catch (error) {
    console.error('Error searching vectors:', error);
    res.status(500).json({ error: 'Failed to search vectors' });
  } finally {
    client.release();
  }
});

app.delete('/collections/:collectionId/vectors/:vectorId', async (req, res) => {
  const { collectionId, vectorId } = req.params;
  
  const client = await pool.connect();
  try {
    // Get collection
    const result = await client.query(
      'SELECT * FROM vector_collections WHERE id = $1',
      [collectionId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    const collection = result.rows[0];
    const tableName = `vector_data_${collection.id.replace(/-/g, '_')}`;
    
    // Delete vector
    const deleteResult = await client.query(
      `DELETE FROM ${tableName} WHERE id = $1 RETURNING id`,
      [vectorId]
    );
    
    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Vector not found' });
    }
    
    res.json({ message: 'Vector deleted successfully' });
  } catch (error) {
    console.error('Error deleting vector:', error);
    res.status(500).json({ error: 'Failed to delete vector' });
  } finally {
    client.release();
  }
});

// Start the server
const PORT = process.env.PORT || 3003;

async function startServer() {
  try {
    // Initialize the database
    await initDatabase();
    
    // Connect to event bus
    await connectToEventBus();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`Vector DB service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer(); 
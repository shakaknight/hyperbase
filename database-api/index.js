const express = require('express');
const cors = require('cors');
const { Client } = require('pg');
const { connect } = require('nats');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Environment variables
const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/hyperbase';
const NATS_URL = process.env.NATS_URL || 'nats://localhost:4222';

// Initialize clients
const pgClient = new Client({ connectionString: DB_URL });
let natsClient;

// Connect to PostgreSQL and NATS
async function connectServices() {
  try {
    await pgClient.connect();
    console.log('Connected to PostgreSQL');

    // Create collections table if it doesn't exist
    await pgClient.query(`
      CREATE TABLE IF NOT EXISTS collections (
        id UUID PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create documents table if it doesn't exist
    await pgClient.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY,
        collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Connect to NATS
    natsClient = await connect({ servers: NATS_URL });
    console.log('Connected to NATS');

    // Start server
    app.listen(PORT, () => {
      console.log(`Database API server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to services:', error);
    process.exit(1);
  }
}

// SQL Endpoints
app.post('/sql/query', async (req, res) => {
  try {
    const { query, params } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    const result = await pgClient.query(query, params || []);
    res.json(result.rows);
  } catch (error) {
    console.error('SQL query error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.post('/sql/transaction', async (req, res) => {
  try {
    const { queries } = req.body;
    
    if (!queries || !Array.isArray(queries) || queries.length === 0) {
      return res.status(400).json({ error: 'Valid queries array is required' });
    }
    
    // Start transaction
    await pgClient.query('BEGIN');
    
    const results = [];
    for (const { query, params } of queries) {
      const result = await pgClient.query(query, params || []);
      results.push(result.rows);
    }
    
    // Commit transaction
    await pgClient.query('COMMIT');
    
    res.json(results);
  } catch (error) {
    // Rollback transaction on error
    await pgClient.query('ROLLBACK');
    console.error('Transaction error:', error);
    res.status(400).json({ error: error.message });
  }
});

// NoSQL Endpoints - Collections
app.post('/collections', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Collection name is required' });
    }
    
    const id = uuidv4();
    await pgClient.query(
      'INSERT INTO collections (id, name) VALUES ($1, $2)',
      [id, name]
    );
    
    // Publish event
    if (natsClient) {
      await natsClient.publish('collection.created', JSON.stringify({ id, name }));
    }
    
    res.status(201).json({ id, name });
  } catch (error) {
    console.error('Create collection error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.get('/collections', async (req, res) => {
  try {
    const result = await pgClient.query('SELECT * FROM collections');
    res.json(result.rows);
  } catch (error) {
    console.error('List collections error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/collections/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pgClient.query('SELECT * FROM collections WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get collection error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/collections/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Collection name is required' });
    }
    
    const result = await pgClient.query(
      'UPDATE collections SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [name, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    // Publish event
    if (natsClient) {
      await natsClient.publish('collection.updated', JSON.stringify(result.rows[0]));
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update collection error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.delete('/collections/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get collection before deletion for event publishing
    const getResult = await pgClient.query('SELECT * FROM collections WHERE id = $1', [id]);
    
    if (getResult.rows.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    await pgClient.query('DELETE FROM collections WHERE id = $1', [id]);
    
    // Publish event
    if (natsClient) {
      await natsClient.publish('collection.deleted', JSON.stringify(getResult.rows[0]));
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Delete collection error:', error);
    res.status(500).json({ error: error.message });
  }
});

// NoSQL Endpoints - Documents
app.post('/collections/:collectionId/documents', async (req, res) => {
  try {
    const { collectionId } = req.params;
    const { data } = req.body;
    
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Document data is required and must be an object' });
    }
    
    // Check if collection exists
    const collectionResult = await pgClient.query('SELECT * FROM collections WHERE id = $1', [collectionId]);
    
    if (collectionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    const id = uuidv4();
    const result = await pgClient.query(
      'INSERT INTO documents (id, collection_id, data) VALUES ($1, $2, $3) RETURNING *',
      [id, collectionId, data]
    );
    
    // Publish event
    if (natsClient) {
      await natsClient.publish('document.created', JSON.stringify(result.rows[0]));
    }
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create document error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.get('/collections/:collectionId/documents', async (req, res) => {
  try {
    const { collectionId } = req.params;
    
    // Check if collection exists
    const collectionResult = await pgClient.query('SELECT * FROM collections WHERE id = $1', [collectionId]);
    
    if (collectionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    const result = await pgClient.query('SELECT * FROM documents WHERE collection_id = $1', [collectionId]);
    res.json(result.rows);
  } catch (error) {
    console.error('List documents error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/collections/:collectionId/documents/:id', async (req, res) => {
  try {
    const { collectionId, id } = req.params;
    
    const result = await pgClient.query(
      'SELECT * FROM documents WHERE id = $1 AND collection_id = $2',
      [id, collectionId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/collections/:collectionId/documents/:id', async (req, res) => {
  try {
    const { collectionId, id } = req.params;
    const { data } = req.body;
    
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Document data is required and must be an object' });
    }
    
    const result = await pgClient.query(
      'UPDATE documents SET data = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND collection_id = $3 RETURNING *',
      [data, id, collectionId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Publish event
    if (natsClient) {
      await natsClient.publish('document.updated', JSON.stringify(result.rows[0]));
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update document error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.delete('/collections/:collectionId/documents/:id', async (req, res) => {
  try {
    const { collectionId, id } = req.params;
    
    // Get document before deletion for event publishing
    const getResult = await pgClient.query(
      'SELECT * FROM documents WHERE id = $1 AND collection_id = $2',
      [id, collectionId]
    );
    
    if (getResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    await pgClient.query('DELETE FROM documents WHERE id = $1 AND collection_id = $2', [id, collectionId]);
    
    // Publish event
    if (natsClient) {
      await natsClient.publish('document.deleted', JSON.stringify(getResult.rows[0]));
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully');
  
  if (natsClient) {
    await natsClient.drain();
    console.log('NATS connection closed');
  }
  
  await pgClient.end();
  console.log('PostgreSQL connection closed');
  
  process.exit(0);
});

// Initialize services
connectServices(); 
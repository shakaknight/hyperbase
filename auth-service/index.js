const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const { Pool } = require('pg');
const { connect } = require('nats');
const otplib = require('otplib');
const { authenticator } = otplib;
// Load environment variables from .env file
require('dotenv').config();

// Initialize Express app
const app = express();
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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
    const subscription = natsConnection.subscribe('user.events');
    for await (const msg of subscription) {
      const event = JSON.parse(msg.data);
      handleUserEvent(event);
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

// Handle user-related events
async function handleUserEvent(event) {
  switch(event.type) {
    case 'user.created':
      console.log(`User created: ${event.data.id}`);
      break;
    case 'user.deleted':
      console.log(`User deleted: ${event.data.id}`);
      break;
    case 'user.login':
      console.log(`User login: ${event.data.id}`);
      break;
    default:
      console.log(`Unknown event type: ${event.type}`);
  }
}

// Initialize database tables
async function initDatabase() {
  const client = await pool.connect();
  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        mfa_secret VARCHAR(255),
        mfa_enabled BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create user_identities table for social logins
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_identities (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        provider VARCHAR(50) NOT NULL,
        provider_user_id VARCHAR(255) NOT NULL,
        provider_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(provider, provider_user_id)
      )
    `);
    
    // Create sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        ip_address VARCHAR(45),
        user_agent TEXT,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    client.release();
  }
}

// Routes
app.post('/register', async (req, res) => {
  const { email, password, fullName } = req.body;
  
  try {
    // Check if user already exists
    const userCheck = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Insert new user
    const result = await pool.query(
      'INSERT INTO users (email, password, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name',
      [email, hashedPassword, fullName]
    );
    
    const newUser = result.rows[0];
    
    // Publish user.created event
    const event = {
      type: 'user.created',
      data: {
        id: newUser.id,
        email: newUser.email
      }
    };
    safePublish('user.events', event);
    
    res.status(201).json({ 
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.full_name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password, mfaCode } = req.body;
  
  try {
    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check MFA if enabled
    if (user.mfa_enabled) {
      if (!mfaCode) {
        return res.status(400).json({ 
          error: 'MFA code required',
          mfaRequired: true
        });
      }
      
      const isValidMfaCode = authenticator.verify({
        token: mfaCode,
        secret: user.mfa_secret
      });
      
      if (!isValidMfaCode) {
        return res.status(401).json({ error: 'Invalid MFA code' });
      }
    }
    
    // Create session
    const sessionId = require('crypto').randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days
    
    await pool.query(
      'INSERT INTO sessions (id, user_id, ip_address, user_agent, expires_at) VALUES ($1, $2, $3, $4, $5)',
      [sessionId, user.id, req.ip, req.headers['user-agent'], expiresAt]
    );
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, sessionId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Publish user.login event
    const event = {
      type: 'user.login',
      data: {
        id: user.id,
        email: user.email
      }
    };
    safePublish('user.events', event);
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to log in' });
  }
});

app.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Delete session
    await pool.query('DELETE FROM sessions WHERE id = $1', [decoded.sessionId]);
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to log out' });
  }
});

// Validate token endpoint for API Gateway authentication
app.get('/validate-token', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if session exists and is valid
    const sessionResult = await pool.query(
      'SELECT * FROM sessions WHERE id = $1 AND user_id = $2 AND expires_at > NOW()',
      [decoded.sessionId, decoded.userId]
    );
    
    if (sessionResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }
    
    // Get user details
    const userResult = await pool.query(
      'SELECT id, email, full_name FROM users WHERE id = $1',
      [decoded.userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    res.json({
      user: {
        id: userResult.rows[0].id,
        email: userResult.rows[0].email,
        fullName: userResult.rows[0].full_name
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    console.error('Token validation error:', error);
    res.status(500).json({ error: 'Failed to validate token' });
  }
});

app.post('/mfa/enable', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Generate MFA secret
    const secret = authenticator.generateSecret();
    
    // Save secret to user
    await pool.query(
      'UPDATE users SET mfa_secret = $1 WHERE id = $2',
      [secret, decoded.userId]
    );
    
    // Generate TOTP URI for QR code
    const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [decoded.userId]);
    const email = userResult.rows[0].email;
    const otpauth = authenticator.keyuri(email, 'HyperBase', secret);
    
    res.json({
      secret,
      otpauth
    });
  } catch (error) {
    console.error('MFA enable error:', error);
    res.status(500).json({ error: 'Failed to enable MFA' });
  }
});

app.post('/mfa/verify', async (req, res) => {
  const { code } = req.body;
  
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user's MFA secret
    const result = await pool.query(
      'SELECT mfa_secret FROM users WHERE id = $1',
      [decoded.userId]
    );
    
    const secret = result.rows[0].mfa_secret;
    
    // Verify code
    const isValid = authenticator.verify({
      token: code,
      secret
    });
    
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid code' });
    }
    
    // Enable MFA
    await pool.query(
      'UPDATE users SET mfa_enabled = TRUE WHERE id = $1',
      [decoded.userId]
    );
    
    res.json({ message: 'MFA enabled successfully' });
  } catch (error) {
    console.error('MFA verify error:', error);
    res.status(500).json({ error: 'Failed to verify MFA code' });
  }
});

app.post('/mfa/disable', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Disable MFA
    await pool.query(
      'UPDATE users SET mfa_enabled = FALSE, mfa_secret = NULL WHERE id = $1',
      [decoded.userId]
    );
    
    res.json({ message: 'MFA disabled successfully' });
  } catch (error) {
    console.error('MFA disable error:', error);
    res.status(500).json({ error: 'Failed to disable MFA' });
  }
});

app.get('/sessions', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get all sessions for user
    const result = await pool.query(
      'SELECT id, ip_address, user_agent, created_at, expires_at FROM sessions WHERE user_id = $1',
      [decoded.userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to get sessions' });
  }
});

app.delete('/sessions/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify session belongs to user
    const sessionCheck = await pool.query(
      'SELECT id FROM sessions WHERE id = $1 AND user_id = $2',
      [id, decoded.userId]
    );
    
    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Delete session
    await pool.query('DELETE FROM sessions WHERE id = $1', [id]);
    
    res.json({ message: 'Session terminated successfully' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Failed to terminate session' });
  }
});

// Start server
const PORT = process.env.PORT || 3005;

// Add a simple health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check endpoint accessed');
  res.status(200).json({ status: 'OK', environment: process.env.NODE_ENV });
});

async function startServer() {
  try {
    // Initialize the database
    await initDatabase();
    
    // Connect to event bus
    await connectToEventBus();
    
    // Start Express server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Auth service running on port ${PORT}`);
      console.log(`Health check available at http://localhost:${PORT}/health`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 
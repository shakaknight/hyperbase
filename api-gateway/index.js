const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { connect } = require('nats');
const rateLimit = require('express-rate-limit');

// Initialize Express app
const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors());

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

// Global rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Too many requests, please try again later.'
  }
});

// Apply rate limiter to all requests
app.use(apiLimiter);

// Authentication middleware
const authenticateRequest = async (req, res, next) => {
  // Skip authentication for login and register endpoints
  if (
    req.path === '/auth/login' || 
    req.path === '/auth/register' ||
    req.path.startsWith('/public/') ||
    req.path === '/health'
  ) {
    return next();
  }
  
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized: Missing authorization header' });
  }
  
  // Forward the request with the auth header to the auth service
  try {
    const response = await fetch('http://localhost:3001/validate-token', {
      method: 'GET',
      headers: {
        'Authorization': authHeader
      }
    });
    
    if (!response.ok) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    
    const data = await response.json();
    req.user = data.user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

// Apply authentication middleware
app.use(authenticateRequest);

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
    
    // Publish request metrics event if NATS is connected
    if (natsConnection) {
      const event = {
        type: 'api.request',
        data: {
          method: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode,
          duration,
          timestamp: new Date().toISOString()
        }
      };
      natsConnection.publish('metrics.events', JSON.stringify(event));
    }
  });
  next();
});

// Service proxies
// Auth Service
app.use('/auth', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: {
    '^/auth': '/'
  }
}));

// Database API Service
app.use('/database', createProxyMiddleware({
  target: 'http://localhost:3002',
  changeOrigin: true,
  pathRewrite: {
    '^/database': '/'
  }
}));

// Vector DB Service
app.use('/vector', createProxyMiddleware({
  target: 'http://localhost:3005',
  changeOrigin: true,
  pathRewrite: {
    '^/vector': '/'
  }
}));

// Unified API
// Create a new user and initialize storage
app.post('/v1/users', async (req, res) => {
  try {
    // 1. Create user in auth service
    const authResponse = await fetch('http://localhost:3001/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    
    if (!authResponse.ok) {
      const error = await authResponse.json();
      return res.status(authResponse.status).json(error);
    }
    
    const userData = await authResponse.json();
    
    // We're skipping storage initialization for now since we don't have that service running
    
    res.status(201).json(userData);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '0.1.0',
    services: {
      gateway: 'healthy'
    }
  });
});

// Start server
const PORT = process.env.PORT || 8000;

async function startServer() {
  await connectToEventBus();
  
  app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
  });
}

startServer(); 
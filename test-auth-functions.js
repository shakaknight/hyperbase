// Direct testing of auth service functions
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './auth-service/.env' });

// Database connection
const pool = new Pool({
  connectionString: process.env.POSTGRES_URI
});

// Helper functions
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

const comparePasswords = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

const generateToken = (userId, sessionId) => {
  return jwt.sign(
    { userId, sessionId },
    process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    { expiresIn: '7d' }
  );
};

// Main functions
async function registerUser(email, password, fullName) {
  try {
    // Check if user already exists
    const userCheck = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (userCheck.rows.length > 0) {
      throw new Error('User already exists');
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Insert new user
    const result = await pool.query(
      'INSERT INTO users (email, password, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name',
      [email, hashedPassword, fullName]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

async function loginUser(email, password) {
  try {
    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }
    
    const user = result.rows[0];
    
    // Verify password
    const passwordMatch = await comparePasswords(password, user.password);
    if (!passwordMatch) {
      throw new Error('Invalid credentials');
    }
    
    // Create session
    const sessionId = require('crypto').randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days
    
    await pool.query(
      'INSERT INTO sessions (id, user_id, ip_address, user_agent, expires_at) VALUES ($1, $2, $3, $4, $5)',
      [sessionId, user.id, '127.0.0.1', 'Test Agent', expiresAt]
    );
    
    // Generate JWT
    const token = generateToken(user.id, sessionId);
    
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name
      }
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

async function getUserSessions(userId) {
  try {
    // Get all sessions for user
    const result = await pool.query(
      'SELECT id, ip_address, user_agent, created_at, expires_at FROM sessions WHERE user_id = $1',
      [userId]
    );
    
    return result.rows;
  } catch (error) {
    console.error('Get sessions error:', error);
    throw error;
  }
}

async function logoutUser(sessionId) {
  try {
    // Delete session
    await pool.query('DELETE FROM sessions WHERE id = $1', [sessionId]);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

async function runTests() {
  try {
    console.log('Starting auth function tests...');
    
    // Generate a unique email for testing
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'Password123!';
    const testName = 'Test User';
    
    console.log(`Registering user: ${testEmail}`);
    const user = await registerUser(testEmail, testPassword, testName);
    console.log('User registered successfully:', user);
    
    console.log(`Logging in user: ${testEmail}`);
    const loginResult = await loginUser(testEmail, testPassword);
    console.log('Login successful:', loginResult);
    
    console.log(`Getting sessions for user ID: ${user.id}`);
    const sessions = await getUserSessions(user.id);
    console.log('User sessions:', sessions);
    
    if (sessions.length > 0) {
      console.log(`Logging out session: ${sessions[0].id}`);
      await logoutUser(sessions[0].id);
      console.log('Logout successful');
    }
    
    console.log('All tests completed successfully!');
    
    // Close the pool
    await pool.end();
  } catch (error) {
    console.error('Test failed:', error);
    // Close the pool
    await pool.end();
  }
}

// Run the tests
runTests(); 
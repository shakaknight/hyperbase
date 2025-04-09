const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3005';
let authToken = null;

// Register a new user
async function register(email, password, fullName) {
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, fullName })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }
    
    console.log('Registration successful:', data);
    return data;
  } catch (error) {
    console.error('Registration error:', error.message);
    throw error;
  }
}

// Login with email and password
async function login(email, password, mfaCode = null) {
  try {
    const body = { email, password };
    if (mfaCode) {
      body.mfaCode = mfaCode;
    }
    
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }
    
    // Save the token for future requests
    authToken = data.token;
    
    console.log('Login successful:', data);
    return data;
  } catch (error) {
    console.error('Login error:', error.message);
    throw error;
  }
}

// Get user sessions
async function getSessions() {
  try {
    if (!authToken) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${BASE_URL}/sessions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch sessions');
    }
    
    console.log('Sessions:', data);
    return data;
  } catch (error) {
    console.error('Get sessions error:', error.message);
    throw error;
  }
}

// Logout
async function logout() {
  try {
    if (!authToken) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${BASE_URL}/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Logout failed');
    }
    
    // Clear token
    authToken = null;
    
    console.log('Logout successful:', data);
    return data;
  } catch (error) {
    console.error('Logout error:', error.message);
    throw error;
  }
}

// Enable MFA
async function enableMFA() {
  try {
    if (!authToken) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${BASE_URL}/mfa/enable`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to enable MFA');
    }
    
    console.log('MFA setup initiated:', data);
    console.log('Scan the QR code with your authenticator app using this URL:', data.otpauth);
    console.log('Or enter this secret manually:', data.secret);
    
    return data;
  } catch (error) {
    console.error('Enable MFA error:', error.message);
    throw error;
  }
}

// Verify MFA code and complete MFA setup
async function verifyMFA(code) {
  try {
    if (!authToken) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${BASE_URL}/mfa/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ code })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to verify MFA code');
    }
    
    console.log('MFA enabled successfully:', data);
    return data;
  } catch (error) {
    console.error('Verify MFA error:', error.message);
    throw error;
  }
}

// Disable MFA
async function disableMFA() {
  try {
    if (!authToken) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${BASE_URL}/mfa/disable`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to disable MFA');
    }
    
    console.log('MFA disabled successfully:', data);
    return data;
  } catch (error) {
    console.error('Disable MFA error:', error.message);
    throw error;
  }
}

// Example usage
async function runTests() {
  try {
    // Generate a unique email for testing
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'Password123!';
    const testName = 'Test User';
    
    // Register a new user
    await register(testEmail, testPassword, testName);
    
    // Login with the new user
    await login(testEmail, testPassword);
    
    // Get sessions
    await getSessions();
    
    // Enable MFA
    const mfaData = await enableMFA();
    console.log('To complete MFA setup, enter the code from your authenticator app');
    
    // To verify MFA, user would need to enter code from their authenticator app
    // await verifyMFA('123456');
    
    // Logout
    await logout();
    
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Check if the script is being run directly
if (require.main === module) {
  runTests();
}

module.exports = {
  register,
  login,
  getSessions,
  logout,
  enableMFA,
  verifyMFA,
  disableMFA
}; 
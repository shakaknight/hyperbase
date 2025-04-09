const axios = require('axios');

const BASE_URL = 'http://localhost:8080';

async function testAuth() {
  try {
    console.log('Testing auth service at:', BASE_URL);
    
    // Testing registration
    const registerData = {
      email: `test${Date.now()}@example.com`,
      password: 'Password123!',
      fullName: 'Test User'
    };
    
    console.log('Attempting to register user:', registerData.email);
    const registerResponse = await axios.post(`${BASE_URL}/register`, registerData);
    console.log('Registration response:', registerResponse.data);
    
    // If we get here, registration was successful
    console.log('Auth service is working correctly!');
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Server responded with error:', {
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server. Connection issue.');
    } else {
      // Something happened in setting up the request
      console.error('Error setting up request:', error.message);
    }
  }
}

testAuth(); 
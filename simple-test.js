const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3005,
  path: '/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const data = JSON.stringify({
  email: 'test@example.com',
  password: 'password123',
  fullName: 'Test User'
});

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('Response body:', responseData);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

// Write data to request body
req.write(data);
req.end();

console.log('Request sent to auth service at http://localhost:3005/register'); 
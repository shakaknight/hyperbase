const http = require('http');

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    message: 'Hello, World!'
  }));
});

// Listen on port 3005
server.listen(3005, '0.0.0.0', () => {
  console.log('Server is running on http://localhost:3005');
}); 
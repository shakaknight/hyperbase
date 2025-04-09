const http = require('http');
const PORT = 7000;

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Server is running!' }));
});

// Add error handling
server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try another port.`);
  }
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Server address:', server.address());
}); 
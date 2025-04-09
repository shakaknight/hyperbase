const express = require('express');
const app = express();
const PORT = 9001;

app.get('/', (req, res) => {
  console.log('Root endpoint accessed');
  res.send('Hello World!');
});

app.get('/health', (req, res) => {
  console.log('Health endpoint accessed');
  res.json({ status: 'OK' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
}); 
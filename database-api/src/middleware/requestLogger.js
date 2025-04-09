/**
 * Request logging middleware
 */

const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;
  
  console.log(`[${new Date().toISOString()}] ${method} ${originalUrl} - Request received from ${ip}`);
  
  // Add response finished listener to log response time
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${method} ${originalUrl} - Response sent with status ${res.statusCode} (${duration}ms)`);
  });
  
  next();
};

module.exports = requestLogger;
/**
 * Error handling middleware
 */

const errorHandler = (err, req, res, next) => {
  // Log the error
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  // Set appropriate status code
  const statusCode = err.statusCode || 500;

  // Send error response
  res.status(statusCode).json({
    status: 'error',
    message: statusCode === 500 ? 'Internal server error' : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler; 
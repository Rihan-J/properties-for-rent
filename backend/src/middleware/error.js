const { NODE_ENV } = require('../config/env');

/**
 * Global error handler — catches all unhandled errors.
 * In production, hides stack traces from clients.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message);

  if (NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // PostgreSQL unique constraint violation
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      error: 'A record with this value already exists',
    });
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      error: 'Referenced record does not exist',
    });
  }

  let statusCode = err.statusCode || err.http_code || (err.name === 'MulterError' ? 413 : 500);
  
  // Prevent third-party API 401/403s (like Cloudinary credentials failing) 
  // from logging the user out in the frontend interceptor.
  if (err.http_code && (statusCode === 401 || statusCode === 403)) {
    statusCode = 502; // Bad Gateway (third party error)
  }

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal server error',
  });
}

module.exports = errorHandler;

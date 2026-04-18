const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const { fail } = require('../utils/response');

/**
 * Verify JWT token from Authorization header.
 * Attaches decoded user { id, role } to req.user.
 */
function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return fail(res, 'Authentication required', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return fail(res, 'Token expired, please login again', 401);
    }
    return fail(res, 'Invalid token', 401);
  }
}

/**
 * Role-based access control.
 * Usage: authorize('owner', 'admin')
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return fail(res, 'Insufficient permissions', 403);
    }
    next();
  };
}

module.exports = { protect, authorize };

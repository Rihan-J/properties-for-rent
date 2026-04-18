const rateLimit = require('express-rate-limit');

/**
 * General rate limiter — 100 requests per minute per IP.
 */
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later' },
});

/**
 * Strict rate limiter for auth routes — 10 requests per minute per IP.
 * Prevents brute-force login attempts.
 */
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many login attempts, please try again later' },
});

module.exports = { generalLimiter, authLimiter };

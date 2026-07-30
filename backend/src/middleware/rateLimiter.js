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
 * Strict rate limiter for auth (login) routes — 10 requests per 5 minutes per IP.
 * Prevents brute-force login attempts.
 */
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many login attempts, please try again later' },
});

/**
 * Ultra-strict rate limiter for registration — 3 requests per hour per IP.
 * Defends against mass registration floods.
 */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many registration attempts from this IP. Please try again later.' },
});

/**
 * Upload rate limiter — 50 requests per hour per IP.
 * Prevents malicious users from filling up Cloudinary storage.
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Upload limit reached. Please try again later.' },
});

module.exports = { generalLimiter, authLimiter, registerLimiter, uploadLimiter };

const { Router } = require('express');
const { register, login, verifyEmail, resendVerification } = require('../controllers/auth.controller');
const { authLimiter, registerLimiter } = require('../middleware/rateLimiter');
const { verifyTurnstile } = require('../middleware/turnstile');

const router = Router();

// Registration: Strict rate limit + Turnstile
router.post('/register', registerLimiter, verifyTurnstile, register);

// Login: Standard auth limit + Turnstile
router.post('/login', authLimiter, verifyTurnstile, login);

// Email Verification routes
router.get('/verify', verifyEmail);
router.post('/resend-verification', resendVerification);

module.exports = router;

const { Router } = require('express');
const { register, login } = require('../controllers/auth.controller');
const { authLimiter } = require('../middleware/rateLimiter');

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

module.exports = router;

const { Router } = require('express');
const { deleteMyAccount } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');

const router = Router();

// Authenticated user can delete their own account
router.delete('/me', protect, deleteMyAccount);

module.exports = router;

const { Router } = require('express');
const { getSupportInfo, updateSupportInfo } = require('../controllers/support.controller');
const { protect, authorize } = require('../middleware/auth.js'); // Assuming auth.js exists

const router = Router();

// Public — anyone can fetch support info
router.get('/', getSupportInfo);

// Admin only — update support info
router.put('/', protect, authorize('admin'), updateSupportInfo);

module.exports = router;

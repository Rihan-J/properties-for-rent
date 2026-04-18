const { Router } = require('express');
const {
  createProperty,
  getProperties,
  getNearbyProperties,
  getPropertyById,
  deleteProperty,
} = require('../controllers/property.controller');
const { protect, authorize } = require('../middleware/auth');

const router = Router();

// Public routes
router.get('/', protect, getProperties);
router.get('/nearby', getNearbyProperties);
router.get('/:id', getPropertyById);

// Protected routes — owner or admin only
router.post('/', protect, authorize('owner', 'admin'), createProperty);
router.delete('/:id', protect, authorize('owner', 'admin'), deleteProperty);

module.exports = router;

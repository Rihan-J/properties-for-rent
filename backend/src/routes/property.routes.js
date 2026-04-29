const { Router } = require('express');
const {
  createProperty,
  getProperties,
  getNearbyProperties,
  getPropertyById,
  deleteProperty,
} = require('../controllers/property.controller');
const { protect, authorize } = require('../middleware/auth');
const { cacheResponse, buildNearbyCacheKey } = require('../middleware/cache');

const router = Router();

// Public routes
router.get('/', protect, cacheResponse(60), getProperties);
router.get('/nearby', cacheResponse(90, { keyBuilder: buildNearbyCacheKey }), getNearbyProperties);
router.get('/:id', getPropertyById);

// Protected routes — owner or admin only
router.post('/', protect, authorize('owner', 'admin'), createProperty);
router.delete('/:id', protect, authorize('owner', 'admin'), deleteProperty);

module.exports = router;

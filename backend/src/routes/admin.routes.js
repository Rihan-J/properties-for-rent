const { Router } = require('express');
const {
  getAllProperties,
  approveProperty,
  deleteProperty,
  getOwnerDetails,
  getAdminStats,
} = require('../controllers/admin.controller');
const {
  getAllReviews,
  deleteReview,
} = require('../controllers/review.controller');
const { protect, authorize } = require('../middleware/auth');
const { updateSupportInfo } = require('../controllers/support.controller');

const router = Router();

// All admin routes require authentication + admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/properties', getAllProperties);
router.patch('/properties/:id/approve', approveProperty);
router.delete('/properties/:id', deleteProperty);

// Owner details
router.get('/users/:id', getOwnerDetails);

// Reviews management
router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', deleteReview);

// Support info management
router.put('/support', updateSupportInfo);

// Analytics
router.get('/stats', getAdminStats);

module.exports = router;

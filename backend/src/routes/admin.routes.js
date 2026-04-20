const { Router } = require('express');
const {
  getAllProperties,
  approveProperty,
  deleteProperty,
  getOwnerDetails,
} = require('../controllers/admin.controller');
const {
  getAllReviews,
  deleteReview,
} = require('../controllers/review.controller');
const { protect, authorize } = require('../middleware/auth');

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

module.exports = router;

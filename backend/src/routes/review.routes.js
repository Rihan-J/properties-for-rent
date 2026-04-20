const { Router } = require('express');
const {
  createReview,
  getPropertyReviews,
} = require('../controllers/review.controller');
const { protect } = require('../middleware/auth');

const router = Router();

// Public: get reviews for a property
router.get('/:propertyId', getPropertyReviews);

// Protected: create review (any authenticated user)
router.post('/', protect, createReview);

module.exports = router;

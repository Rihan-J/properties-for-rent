const { Router } = require('express');
const {
  getAllProperties,
  approveProperty,
  deleteProperty,
} = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth');

const router = Router();

// All admin routes require authentication + admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/properties', getAllProperties);
router.patch('/properties/:id/approve', approveProperty);
router.delete('/properties/:id', deleteProperty);

module.exports = router;

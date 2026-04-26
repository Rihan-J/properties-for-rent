const { Router } = require('express');
const { getSupportInfo } = require('../controllers/support.controller');

const router = Router();

// Public — anyone can fetch support info
router.get('/', getSupportInfo);

module.exports = router;

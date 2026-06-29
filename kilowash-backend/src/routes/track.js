const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Public tracking route without auth middleware
router.get('/:order_code', orderController.trackOrder);

module.exports = router;

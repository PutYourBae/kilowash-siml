const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/', authMiddleware, roleMiddleware(['admin', 'kasir', 'owner']), paymentController.processPayment);
router.get('/:order_id', authMiddleware, roleMiddleware(['admin', 'owner']), paymentController.getPaymentDetail);

module.exports = router;

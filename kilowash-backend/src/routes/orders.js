const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, orderController.getOrders);
router.post('/', authMiddleware, roleMiddleware(['admin', 'kasir', 'owner', 'branch_admin']), orderController.createOrder);
router.get('/:id', authMiddleware, orderController.getOrderDetail);
router.put('/:id', authMiddleware, roleMiddleware(['admin', 'owner', 'branch_admin']), orderController.updateOrder);
router.patch('/:id/status', authMiddleware, orderController.updateOrderStatus);
router.delete('/:id', authMiddleware, roleMiddleware(['admin', 'owner', 'branch_admin']), orderController.cancelOrder);

module.exports = router;

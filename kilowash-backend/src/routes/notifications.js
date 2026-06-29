const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/resend/:order_id', authMiddleware, roleMiddleware(['admin']), notificationController.resendNotification);
router.get('/logs/:order_id', authMiddleware, roleMiddleware(['admin', 'owner']), notificationController.getNotificationLogs);

module.exports = router;

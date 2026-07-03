const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// FR-N4: Kirim ulang notifikasi (?type=ready|registered)
router.post('/resend/:order_id', authMiddleware, roleMiddleware(['admin', 'owner', 'branch_admin']), notificationController.resendNotification);

// FR-N3: Log notifikasi per order (?type=ready|registered)
router.get('/logs/:order_id', authMiddleware, roleMiddleware(['admin', 'owner', 'branch_admin']), notificationController.getNotificationLogs);

// FR-N3: Semua log notifikasi dengan filter (?type=ready|registered&status=gagal)
router.get('/logs', authMiddleware, roleMiddleware(['admin', 'owner']), notificationController.getAllNotificationLogs);

module.exports = router;

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const ownerAdmin = roleMiddleware(['owner', 'admin']);

router.get('/daily', authMiddleware, ownerAdmin, reportController.getDailyReport);
router.get('/monthly', authMiddleware, ownerAdmin, reportController.getMonthlyReport);
router.get('/export', authMiddleware, ownerAdmin, reportController.exportCSV);

module.exports = router;

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const ownerOnly = roleMiddleware(['owner']);

router.get('/daily', authMiddleware, ownerOnly, reportController.getDailyReport);
router.get('/monthly', authMiddleware, ownerOnly, reportController.getMonthlyReport);
router.get('/export', authMiddleware, ownerOnly, reportController.exportCSV);

module.exports = router;

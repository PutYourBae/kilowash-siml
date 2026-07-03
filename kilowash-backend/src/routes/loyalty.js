const express = require('express');
const router = express.Router();
const loyaltyController = require('../controllers/loyaltyController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// FR-M3: Konfigurasi rasio poin (Admin/Owner)
router.get('/config', authMiddleware, roleMiddleware(['owner', 'admin']), loyaltyController.getConfig);

// FR-M4: Riwayat poin pelanggan
router.get('/:customer_id', authMiddleware, roleMiddleware(['owner', 'admin', 'branch_admin', 'kasir']), loyaltyController.getPointHistory);

module.exports = router;

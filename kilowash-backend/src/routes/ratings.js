const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// FR-R1 & NFR-R1: Submit rating — PUBLIC (tanpa login, via link tracking)
router.post('/', ratingController.submitRating);

// Cek apakah order sudah dirating — PUBLIC
router.get('/check/:order_code', ratingController.checkRating);

// FR-R3: Admin/Owner melihat daftar rating
router.get('/', authMiddleware, roleMiddleware(['owner', 'admin', 'branch_admin']), ratingController.getRatings);

// FR-R4: Toggle flag (tandai/buka tanda rating rendah)
router.patch('/:id/flag', authMiddleware, roleMiddleware(['owner', 'admin', 'branch_admin']), ratingController.toggleFlag);

module.exports = router;

const express = require('express');
const router = express.Router();
const masterController = require('../controllers/masterController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/services', masterController.getServices);
router.post('/services', authMiddleware, roleMiddleware(['owner']), masterController.createService);
router.put('/services/:id', authMiddleware, roleMiddleware(['owner']), masterController.updateService);

router.get('/users', authMiddleware, roleMiddleware(['owner']), masterController.getUsers);
router.post('/users', authMiddleware, roleMiddleware(['owner']), masterController.createUser);
router.put('/users/:id', authMiddleware, roleMiddleware(['owner']), masterController.updateUser);

router.get('/outlet', authMiddleware, roleMiddleware(['owner']), masterController.getOutletInfo);

module.exports = router;

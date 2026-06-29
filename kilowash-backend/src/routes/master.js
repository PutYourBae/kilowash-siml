const express = require('express');
const router = express.Router();
const masterController = require('../controllers/masterController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/services', masterController.getServices);
router.post('/services', authMiddleware, roleMiddleware(['admin']), masterController.createService);
router.put('/services/:id', authMiddleware, roleMiddleware(['admin']), masterController.updateService);

router.get('/users', authMiddleware, roleMiddleware(['admin', 'owner']), masterController.getUsers);
router.post('/users', authMiddleware, roleMiddleware(['admin']), masterController.createUser);
router.put('/users/:id', authMiddleware, roleMiddleware(['admin']), masterController.updateUser);

router.get('/outlet', authMiddleware, roleMiddleware(['admin', 'owner']), masterController.getOutletInfo);

module.exports = router;

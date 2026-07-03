const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Semua route cabang hanya untuk Owner
router.get('/',    authMiddleware, roleMiddleware(['owner', 'admin', 'branch_admin']), branchController.getBranches);
router.get('/:id', authMiddleware, roleMiddleware(['owner', 'admin', 'branch_admin']), branchController.getBranchById);
router.post('/',   authMiddleware, roleMiddleware(['owner']), branchController.createBranch);
router.put('/:id', authMiddleware, roleMiddleware(['owner']), branchController.updateBranch);
router.delete('/:id', authMiddleware, roleMiddleware(['owner']), branchController.deleteBranch);

module.exports = router;

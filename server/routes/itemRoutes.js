const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, itemController.getItems);
router.post('/', authMiddleware, itemController.addItem);
router.put('/:id', authMiddleware, itemController.updateItem);
router.delete('/:id', authMiddleware, itemController.deleteItem);
router.delete('/bulk-delete', authMiddleware, itemController.bulkDeleteItems);
router.post('/bulk-restore', authMiddleware, itemController.bulkRestoreItems);

module.exports = router;
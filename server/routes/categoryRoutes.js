const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, categoryController.getCategories);
router.post('/', authMiddleware, categoryController.addCategory);
router.put('/:id', authMiddleware, categoryController.editCategory);
router.delete('/:id', authMiddleware, categoryController.deleteCategory);
router.post('/bulk-delete', authMiddleware, categoryController.bulkDeleteCategories);

module.exports = router;
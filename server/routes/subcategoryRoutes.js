const express = require('express');
const router = express.Router();
const subcategoryController = require('../controllers/subcategoryController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, subcategoryController.getSubcategories);
router.post('/', authMiddleware, subcategoryController.addSubcategory);
router.put('/:id', authMiddleware, subcategoryController.updateSubcategory);
router.delete('/:id', authMiddleware, subcategoryController.deleteSubcategory);
router.post('/bulk-delete', authMiddleware, subcategoryController.bulkDeleteSubcategories);

module.exports = router;
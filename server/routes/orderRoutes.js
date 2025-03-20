const express = require('express');
const { getOrders, deleteOrder, bulkDeleteOrders } = require('../controllers/orderController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', auth, getOrders);
router.delete('/:id', auth, deleteOrder);
router.post('/bulk-delete', auth, bulkDeleteOrders);

module.exports = router;
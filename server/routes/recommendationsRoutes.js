const express = require('express');
const {
    fetchProducts,
    fetchRecommendations,
    addRecommendation,
    removeRecommendation,
} = require('../controllers/recommendationsController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/products', auth, fetchProducts);
router.get('/', auth, fetchRecommendations);
router.post('/add', auth, addRecommendation);
router.delete('/remove/:productId', auth, removeRecommendation);

module.exports = router;
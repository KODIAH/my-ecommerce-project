const express = require('express');
const { getAnalytics } = require('../controllers/analyticsController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', auth, getAnalytics);

module.exports = router;
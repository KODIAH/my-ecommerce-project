const express = require('express');
const {
    fetchLoyaltyMembers,
    updateLoyaltySettings,
    redeemPoints,
} = require('../controllers/loyaltyController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/members', auth, fetchLoyaltyMembers);
router.post('/update', auth, updateLoyaltySettings);
router.post('/redeem/:email', auth, redeemPoints);

module.exports = router;
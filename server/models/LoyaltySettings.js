const mongoose = require('mongoose');

const LoyaltySettingsSchema = new mongoose.Schema({
    pointsPerDollar: { type: Number, default: 1 },
    redeemRate: { type: Number, default: 100 }, // Points required to redeem $1
});

module.exports = mongoose.models.LoyaltySettings || mongoose.model('LoyaltySettings', LoyaltySettingsSchema);
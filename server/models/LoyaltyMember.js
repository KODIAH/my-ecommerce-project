const mongoose = require('mongoose');

const LoyaltyMemberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    points: { type: Number, default: 0 },
});

module.exports = mongoose.models.LoyaltyMember || mongoose.model('LoyaltyMember', LoyaltyMemberSchema);
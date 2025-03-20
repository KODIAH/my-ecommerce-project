const LoyaltyMember = require('../models/LoyaltyMember');
const LoyaltySettings = require('../models/LoyaltySettings');

// Fetch all loyalty members
const fetchLoyaltyMembers = async (req, res) => {
    try {
        const members = await LoyaltyMember.find();
        res.json(members);
    } catch (error) {
        console.error("Error fetching loyalty members:", error);
        res.status(500).json({ message: "Error fetching loyalty members" });
    }
};

// Update loyalty settings
const updateLoyaltySettings = async (req, res) => {
    const { pointsPerDollar, redeemRate } = req.body;

    try {
        let settings = await LoyaltySettings.findOne();
        if (!settings) {
            settings = new LoyaltySettings();
        }

        settings.pointsPerDollar = pointsPerDollar;
        settings.redeemRate = redeemRate;
        await settings.save();

        res.json({ message: "Loyalty settings updated successfully" });
    } catch (error) {
        console.error("Error updating loyalty settings:", error);
        res.status(500).json({ message: "Error updating loyalty settings" });
    }
};

// Redeem points for a member
const redeemPoints = async (req, res) => {
    const { email } = req.params;

    try {
        const member = await LoyaltyMember.findOne({ email });
        if (!member) {
            return res.status(404).json({ message: "Member not found" });
        }

        const settings = await LoyaltySettings.findOne();
        if (!settings) {
            return res.status(500).json({ message: "Loyalty settings not found" });
        }

        const pointsRequired = settings.redeemRate;
        if (member.points < pointsRequired) {
            return res.status(400).json({ message: "Not enough points to redeem" });
        }

        member.points -= pointsRequired;
        await member.save();

        res.json({ message: "Points redeemed successfully" });
    } catch (error) {
        console.error("Error redeeming points:", error);
        res.status(500).json({ message: "Error redeeming points" });
    }
};

module.exports = {
    fetchLoyaltyMembers,
    updateLoyaltySettings,
    redeemPoints,
};
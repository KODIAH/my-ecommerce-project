const mongoose = require('mongoose');

const RecommendationSchema = new mongoose.Schema({
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'item', required: true },
});

module.exports = mongoose.models.Recommendation || mongoose.model('Recommendation', RecommendationSchema);
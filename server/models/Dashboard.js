// models/Dashboard.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    amount: Number,
    product: String,
    date: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

class Dashboard {
    static async getTotalOrders() {
        return await Order.countDocuments();
    }

    static async getTotalRevenue() {
        const result = await Order.aggregate([
            { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
        ]);
        return result.length > 0 ? result[0].totalRevenue : 0;
    }

    static async getPopularProduct() {
        const result = await Order.aggregate([
            { $group: { _id: '$product', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);
        return result.length > 0 ? result[0]._id : 'N/A';
    }
}

module.exports = Dashboard;
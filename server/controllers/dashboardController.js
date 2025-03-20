// controllers/dashboardController.js
const Dashboard = require('../models/Dashboard');

const getDashboardData = async (req, res) => {
    try {
        const totalOrders = await Dashboard.getTotalOrders();
        const totalRevenue = await Dashboard.getTotalRevenue();
        const popularProduct = await Dashboard.getPopularProduct();

        res.json({
            totalOrders,
            totalRevenue,
            popularProduct
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ message: 'Failed to fetch dashboard data' });
    }
};

module.exports = {
    getDashboardData
};
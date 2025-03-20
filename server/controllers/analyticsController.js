const Order = require('../models/Order');

const getAnalytics = async (req, res) => {
    const { start, end } = req.query;

    try {
        // Build the date filter
        const dateFilter = {};
        if (start && end) {
            dateFilter.createdAt = {
                $gte: new Date(start),
                $lte: new Date(end),
            };
        }

        // Fetch total orders and revenue
        const orders = await Order.find(dateFilter);
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

        // Fetch popular product (example logic)
        const productCounts = {};
        orders.forEach(order => {
            // Assuming each order has a 'product' field
            if (order.product) {
                productCounts[order.product] = (productCounts[order.product] || 0) + 1;
            }
        });
        const popularProduct = Object.keys(productCounts).reduce((a, b) => productCounts[a] > productCounts[b] ? a : b, "N/A");

        // Fetch sales trends (group by date)
        const salesTrends = await Order.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    sales: { $sum: "$totalAmount" },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        res.json({
            totalOrders,
            totalRevenue,
            popularProduct,
            salesTrends: salesTrends.map(item => ({ date: item._id, sales: item.sales })),
        });
    } catch (error) {
        console.error("Error fetching analytics:", error);
        res.status(500).json({ message: "Error fetching analytics data" });
    }
};

module.exports = { getAnalytics };
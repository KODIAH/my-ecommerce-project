const Order = require('../models/Order');

// Fetch orders with pagination
const getOrders = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        const orders = await Order.find().skip(skip).limit(limit);
        const totalOrders = await Order.countDocuments();
        res.json({ orders, totalPages: Math.ceil(totalOrders / limit) });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error });
    }
};

// Delete a single order
const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting order', error });
    }
};

// Bulk delete orders
const bulkDeleteOrders = async (req, res) => {
    try {
        const { orderIds } = req.body;
        await Order.deleteMany({ _id: { $in: orderIds } });
        res.json({ message: `${orderIds.length} orders deleted successfully` });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting orders', error });
    }
};

module.exports = { getOrders, deleteOrder, bulkDeleteOrders };
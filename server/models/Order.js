const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    status: { type: String, required: true, default: 'Pending' },
}, { timestamps: true });

// Check if the model already exists before compiling it
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

module.exports = Order;
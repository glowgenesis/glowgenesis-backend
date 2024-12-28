// models/Order.js
const mongoose = require('mongoose');

// Create Order Schema
const OrderSchema = new mongoose.Schema({
  productId: { type: [String], required: true, ref: 'Product' }, // Array of product IDs
  billAmount: { type: Number, required: true }, // Total bill amount
  email: { type: String, required: true }, // Customer email
  createdAt: { type: Date, default: Date.now }, // Timestamp
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;

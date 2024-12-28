const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  razorpay_order_id: { type: String, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  receipt: { type: String, required: true },
  notes: { type: Object, default: {} },
  created_at: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

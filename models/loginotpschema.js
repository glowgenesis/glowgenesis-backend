const mongoose = require('mongoose');

const LoginotpSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, unique: true },
}, { timestamps: true });

module.exports = mongoose.model('loginotp', LoginotpSchema);

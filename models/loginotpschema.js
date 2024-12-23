const mongoose = require('mongoose');

const LoginotpSchema = new mongoose.Schema(
  {
    phoneNumber: { type: String, required: true, unique: true },
    otp: { type: String, required: false },
    otpCreatedAt: { type: Date, required: false },
    token: { type: String, required: false }, // JWT or session token
  },
  { timestamps: true }
);

module.exports = mongoose.model('loginotp', LoginotpSchema);

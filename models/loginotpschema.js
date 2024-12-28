const mongoose = require('mongoose');

// Address Schema
const AddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  pincode: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  houseDetails: { type: String, required: true },
  roadDetails: { type: String, required: true },
  landmark: { type: String, required: false },
}, { _id: false });

// Loginotp Schema
const LoginotpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true }, // Ensure email is always required
    otp: { type: String, required: false },
    otpCreatedAt: { type: Date, required: false },
    token: { type: String, required: false }, // JWT or session token
    address: { type: AddressSchema, required: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('loginotp', LoginotpSchema);

const express = require('express');
const { createOrder, verifyPayment } = require('../controllers/razorpay');
const router = express.Router();

router.post('/create-order', createOrder); // Create payment order
router.post('/verify-payment', verifyPayment); // Verify payment signature

module.exports = router;

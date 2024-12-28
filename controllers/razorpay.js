const Razorpay = require('razorpay');
const crypto = require('crypto');


// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create a payment order
exports.createOrder = async (req, res) => {
  const { amount, currency, receipt, notes } = req.body;

  console.log(req.body);

  // Validate input
  if (!amount || !currency || !receipt) {
    return res.status(400).json({ message: 'Amount, currency, and receipt are required' });
  }

  try {
    const options = {
      amount: amount, // Convert to smallest currency unit (paise for INR)
      currency,
      receipt,
      notes: notes || {}, // Optional notes
    };

    const order = await razorpay.orders.create(options);
    res.status(201).json({
      success: true,
      order,
      key_id: process.env.RAZORPAY_KEY_ID, // Send to client for frontend SDK
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Verify payment signature
exports.verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ message: 'All payment details are required' });
    }

    try {
        // Log the received data for debugging
        console.log('Order ID:', razorpay_order_id);
        console.log('Payment ID:', razorpay_payment_id);
        console.log('Signature:', razorpay_signature);

        // Generate expected signature
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        // Log the expected signature for debugging
        console.log('Expected Signature:', expectedSignature);

        // Compare signatures
        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }

        res.status(200).json({ success: true, message: 'Payment verified successfully' });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
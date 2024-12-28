// controllers/orderController.js

const Order = require("../models/orderschema");


// Controller to store an order
module.exports.storeOrder = async (req, res) => {
  const { productId, billAmount, email } = req.body;

  if (!productId || !billAmount || !email) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Create a new order
    const order = new Order({
      productId,
      billAmount,
      email,
    });

    // Save the order to the database
    await order.save();

    res.status(201).json({ message: 'Order stored successfully', order });
  } catch (error) {
    console.error('Error storing order:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports.getOrdersByEmail = async (req, res) => {
    const { email } = req.params;  // Email is passed as a URL parameter
  
    if (!email) {
      return res.status(400).json({ message: 'Email parameter is required' });
    }
  
    try {
      // Find orders associated with the provided email and populate product details
      const orders = await Order.find({ email })
        .populate('productId', 'name price rating review shortDescription'); // Only populate productId
  
      if (!orders || orders.length === 0) {
        return res.status(404).json({ message: 'No orders found for this email' });
      }
  
      res.status(200).json({ message: 'Orders retrieved successfully', orders });
    } catch (error) {
      console.error('Error retrieving orders:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  
  
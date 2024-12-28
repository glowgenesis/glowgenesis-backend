// routes/orderRoutes.js
const express = require('express');
const { storeOrder, getOrdersByEmail } = require('../controllers/ordersController');


const router = express.Router();

// Define the POST route for storing an order
router.post('/order', storeOrder);

router.get('/orders/:email', getOrdersByEmail);

module.exports = router;

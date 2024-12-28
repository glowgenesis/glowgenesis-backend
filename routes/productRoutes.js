// routes/productRoutes.js
const express = require('express');
const { createProduct, getAllProducts, getProductById } = require('../controllers/productsController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// Route to create a new product
router.post('/add-product', auth, createProduct);

// Route to get all products
router.get('/products', getAllProducts);

// Route to get a product by ID
router.get('/products/:id', getProductById);

module.exports = router;

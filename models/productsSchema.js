// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number },
    rating: { type: Number, default: 0 },
    review: { type: String },
    shortDescription: { type: String },
    longDescription: { type: String },
    image: { type: String }, // URL of the product image
    highlights: [{ type: String }] // Array of strings for highlights
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;

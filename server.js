const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const loginotproute = require('./routes/loginotproute')
const productRoutes = require('./routes/productRoutes');
const razorpayroute = require('./routes/razorpayroute');

dotenv.config();


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/route', userRoutes);
app.use('/route', loginotproute)
app.use('/route', productRoutes);
app.use('/route', razorpayroute);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

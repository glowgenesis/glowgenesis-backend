const express = require('express');
const { loginOrRegister, verifyOtp } = require('../controllers/loginotp');
 // Assuming authController contains the above functions
const router = express.Router();

router.post('/login', loginOrRegister);
router.post('/verify-otp', verifyOtp);

module.exports = router;

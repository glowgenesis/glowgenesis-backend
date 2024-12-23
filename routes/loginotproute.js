const express = require('express');
const { loginOrRegister, verifyOtp, validateToken } = require('../controllers/loginotp');
 // Assuming authController contains the above functions
const router = express.Router();

router.post('/login', loginOrRegister);
router.post('/verify-otp', verifyOtp);
router.post('/token-validate', validateToken);

module.exports = router;

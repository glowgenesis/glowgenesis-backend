const express = require('express');
const { loginOrRegister, verifyOtp, validateToken, updateUserData, getUserAddress, getUserdetails } = require('../controllers/loginotp');
 // Assuming authController contains the above functions
const router = express.Router();

router.post('/login', loginOrRegister);
router.post('/verify-otp', verifyOtp);
router.post('/token-validate', validateToken);
router.put('/user/update', updateUserData);
router.post('/user/address', getUserAddress);
router.post('/user/details', getUserdetails);


module.exports = router;

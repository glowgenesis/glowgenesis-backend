const bcrypt = require('bcrypt');
const axios = require('axios'); // For sending requests to Meta API
const otpGenerator = require('otp-generator'); // For generating OTPs
const loginotpschema = require('../models/loginotpschema');
const jwt = require('jsonwebtoken');


// Function to send OTP via Meta's WhatsApp API
const sendOtpOnWhatsApp = async (phoneNumber, otp) => {
  const metaApiUrl = 'https://graph.facebook.com/v16.0/544344255421377/messages';

  try {
    await axios.post(
      metaApiUrl,
    //   {
    //     messaging_product: 'whatsapp',
    //     to: phoneNumber,
    //     type: 'template',
    //     template: {
    //       name: 'verification ', // Replace with your WhatsApp template name
    //       language: { code: 'en_US' },
    //       components: [
    //         {
    //           type: 'body',
    //           parameters: [ { type: 'text', text: otp },],
    //         },
    //       ],
    //     },
    //   },
    {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'template',
        template: {
          name: 'customerid', // Replace with your WhatsApp template name
          language: { code: 'en_US' },
          components: [
            {
              type: 'body',
              parameters: [ {
                type: "text",
                text: otp
              }],
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.metaAccessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(`OTP sent to ${phoneNumber}`);
  } catch (error) {
    console.error('Error sending OTP:', otp);
    console.error('Error sending OTP:', error.response?.data || error.message);
    throw new Error('Failed to send OTP');
  }
};

// Login or Register
exports.loginOrRegister = async (req, res) => {
    const { phoneNumber } = req.body;
  
    if (!phoneNumber) {
      return res.status(400).json({ message: 'Phone number is required' });
    }
  
    try {
      // Generate numeric-only OTP
      let otp = otpGenerator.generate(6, {
        digits: true,
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
  
      // Check if user exists
      let user = await loginotpschema.findOne({ phoneNumber });
  
      if (!user) {
        // Create a new user with OTP
        user = await loginotpschema.create({
          phoneNumber,
          otp,
          otpCreatedAt: Date.now(),
        });
      } else {
        // Update OTP for existing user
        user.otp = otp;
        user.otpCreatedAt = Date.now();
        await user.save();
      }
  
      // Attempt to send OTP via WhatsApp
      try {
        await sendOtpOnWhatsApp(phoneNumber, otp);
        res.status(200).json({ message: 'OTP sent successfully' });
      } catch (error) {
        console.error('Error sending OTP:', error.message);
        // Respond with a partial success message
        res.status(500).json({
          message: 'OTP saved but failed to send. Please try again.',
        });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  

// Verify OTP
exports.verifyOtp = async (req, res) => {
    const { phoneNumber, otp } = req.body;
    const secretKey = process.env.JWT_SECRET;
    console.log(req.body);
    
  
    if (!phoneNumber || !otp) return res.status(400).json({ message: 'Phone number and OTP are required' });
  
    try {
      // Find user by phone number
      const user = await loginotpschema.findOne({ phoneNumber });
  
      if (!user || user.otp !== otp) {
        return res.status(401).json({ message: 'Invalid or expired OTP' });
      }
  
      // OTP validity: 5 minutes
      const otpAge = Date.now() - new Date(user.otpCreatedAt).getTime();
      if (otpAge > 5 * 60 * 1000) {
        return res.status(401).json({ message: 'OTP expired' });
      }
  
      // Generate JWT token
      const token = jwt.sign({ id: user._id, phoneNumber }, secretKey, {
        expiresIn: '7d', // Token validity
      });
  
      // Save token in the database
      user.token = token;
      user.otp = null; // Clear OTP after verification
      await user.save();
  
      res.status(200).json({ message: 'Login successful', token });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  exports.validateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const secretKey = process.env.JWT_SECRET;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token is required or improperly formatted' });
    }

    const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"
    console.log('Received Token:', token);
    console.log('JWT Secret Key:', secretKey);

    try {
        const decoded = jwt.verify(token, secretKey); // Verify the token
        req.user = decoded; // Attach user data to the request
        res.status(200).json({ message: 'Token validated', user: decoded }); // Respond with success
    } catch (err) {
        console.error('Token verification error:', err);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};


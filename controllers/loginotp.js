const axios = require('axios'); // For sending requests to Meta API
const otpGenerator = require('otp-generator'); // For generating OTPs
const loginotpschema = require('../models/loginotpschema');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();


// Function to send OTP via Meta's WhatsApp API
// const sendOtpOnWhatsApp = async (phoneNumber, otp) => {
//   const metaApiUrl = 'https://graph.facebook.com/v16.0/544344255421377/messages';

//   try {
//     await axios.post(
//       metaApiUrl,
//       {
//         messaging_product: 'whatsapp',
//         to: phoneNumber,
//         type: 'template',
//         template: {
//           name: 'verification', // Replace with your WhatsApp template name
//           language: { code: 'en' },
//           components: [
//             {
//               type: 'body',
//               parameters: [ { type: 'text', text: otp },],
//             },
//           ],
//         },
//       },
//     // {
//     //     messaging_product: 'whatsapp',
//     //     to: phoneNumber,
//     //     type: 'template',
//     //     template: {
//     //       name: 'customerid', // Replace with your WhatsApp template name
//     //       language: { code: 'en_US' },
//     //       components: [
//     //         {
//     //           type: 'body',
//     //           parameters: [ {
//     //             type: "text",
//     //             text: otp
//     //           }],
//     //         },
//     //       ],
//     //     },
//     //   },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.metaAccessToken}`,
//           'Content-Type': 'application/json',
//         },
//       }
//     );
//     console.log(`OTP sent to ${phoneNumber}`);
//   } catch (error) {
//     console.error('Error sending OTP:', otp);
//     console.error('Error sending OTP:', error.response?.data || error.message);
//     throw new Error('Failed to send OTP');
//   }
// };

const sendOtpOnWhatsApp = async (phoneNumber, otp) => {
  const metaApiUrl = 'https://graph.facebook.com/v16.0/544344255421377/messages';

  try {
    await axios.post(
      metaApiUrl,
      {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'template',
        template: {
          name: 'verification', // Ensure this matches your approved template name
          language: { code: 'en' }, // Ensure this matches the language of the template
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: otp }, // Dynamic OTP text
              ],
            },
            {
              type: 'button',
              sub_type: 'url',
              index: 0, // Button index (0-based)
              parameters: [
                { type: 'text', text: otp }, // Short dynamic placeholder text for URL
              ],
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


const transporter = nodemailer.createTransport({
  
  host: 'smtpout.secureserver.net',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
  }
});



// Function to send OTP email
const sendOtpEmail = async (email, otp) => {
  console.log(email);
  console.log(process.env.EMAIL_PASSWORD);
  const mailOptions = {
    from: process.env.EMAIL, // Your email address
    to: email, // Recipient email address
    subject: 'Your OTP for Verification',
    text: `Your OTP for verification is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP sent successfully to email');
  } catch (error) {
    console.error('Error sending OTP:', error.message);
    throw new Error('Failed to send OTP email');
  }
};

// Login or Register
// exports.loginOrRegister = async (req, res) => {
//     const { phoneNumber } = req.body;
  
//     if (!phoneNumber) {
//       return res.status(400).json({ message: 'Phone number is required' });
//     }
  
//     try {
//       // Generate numeric-only OTP
//       let otp = otpGenerator.generate(6, {
//         digits: true,
//         upperCaseAlphabets: false,
//         lowerCaseAlphabets: false,
//         specialChars: false,
//       });
  
//       // Check if user exists
//       let user = await loginotpschema.findOne({ phoneNumber });
  
//       if (!user) {
//         // Create a new user with OTP
//         user = await loginotpschema.create({
//           phoneNumber,
//           otp,
//           otpCreatedAt: Date.now(),
//         });
//       } else {
//         // Update OTP for existing user
//         user.otp = otp;
//         user.otpCreatedAt = Date.now();
//         await user.save();
//       }
  
//       // Attempt to send OTP via WhatsApp
//       try {
//         await sendOtpOnWhatsApp(phoneNumber, otp);
//         res.status(200).json({ message: 'OTP sent successfully' });
//       } catch (error) {
//         console.error('Error sending OTP:', error.message);
//         // Respond with a partial success message
//         res.status(500).json({
//           message: 'OTP saved but failed to send. Please try again.',
//         });
//       }
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   };
  
exports.loginOrRegister = async (req, res) => {
  const { email } = req.body;

  // Ensure email is provided
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Generate OTP
    const otp = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // Check if user exists in the database
    let user = await loginotpschema.findOne({ email });

    if (!user) {
      // Create a new user with OTP
      user = await loginotpschema.create({
        email,
        otp,
        otpCreatedAt: Date.now(),
      });
    } else {
      // Update OTP for existing user
      user.otp = otp;
      user.otpCreatedAt = Date.now();
      await user.save();
    }

    // Send OTP via email
    try {
      await sendOtpEmail(email, otp);
      return res.status(200).json({ message: 'OTP sent to email successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to send OTP email. Please try again.' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.verifyOtp = async (req, res) => {
  const { phoneNumber, email, otp } = req.body; // Accept both phone number and email
  const secretKey = process.env.JWT_SECRET;

  if ((!phoneNumber && !email) || !otp) {
    return res.status(400).json({ message: 'Phone number/email and OTP are required' });
  }

  try {
    // Find the user by phone number or email
    let user;
    if (email) {
      user = await loginotpschema.findOne({ email });
    } else if (phoneNumber) {
      user = await loginotpschema.findOne({ phoneNumber });
    }

    // Check if user exists and OTP matches
    if (!user || user.otp !== otp) {
      return res.status(401).json({ message: 'Invalid or expired OTP' });
    }

    // OTP validity: 5 minutes
    const otpAge = Date.now() - new Date(user.otpCreatedAt).getTime();
    if (otpAge > 5 * 60 * 1000) {
      return res.status(401).json({ message: 'OTP expired' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, phoneNumber, email }, secretKey, {
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


// Verify OTP
// exports.verifyOtp = async (req, res) => {
//     const { phoneNumber, otp } = req.body;
//     const secretKey = process.env.JWT_SECRET;
//     console.log(req.body);
    
  
//     if (!phoneNumber || !otp) return res.status(400).json({ message: 'Phone number and OTP are required' });
  
//     try {
//       // Find user by phone number
//       const user = await loginotpschema.findOne({ phoneNumber });
  
//       if (!user || user.otp !== otp) {
//         return res.status(401).json({ message: 'Invalid or expired OTP' });
//       }
  
//       // OTP validity: 5 minutes
//       const otpAge = Date.now() - new Date(user.otpCreatedAt).getTime();
//       if (otpAge > 5 * 60 * 1000) {
//         return res.status(401).json({ message: 'OTP expired' });
//       }
  
//       // Generate JWT token
//       const token = jwt.sign({ id: user._id, phoneNumber }, secretKey, {
//         expiresIn: '7d', // Token validity
//       });
  
//       // Save token in the database
//       user.token = token;
//       user.otp = null; // Clear OTP after verification
//       await user.save();
  
//       res.status(200).json({ message: 'Login successful', token });
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   };

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

//address

// Update User Data API
exports.updateUserData = async (req, res) => {
  const {  email, address } = req.body;

  try {
    const user = await loginotpschema.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    if (email) user.email = email;
    if (address) user.address = address;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User data updated successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserAddress = async (req, res) => {
  const { email } = req.body; // Assuming the email is passed in the request body

  try {
    // Find the user by email
    const user = await loginotpschema.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if address exists
    if (!user.address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // Return the user's address
    res.status(200).json({
      success: true,
      message: 'User address fetched successfully',
      address: user.address,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserdetails = async (req, res) => {
  const { email } = req.body; // Assuming the email is passed in the request body

  try {
    // Find the user by email
    const user = await loginotpschema.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return the user's address
    res.status(200).json({
      success: true,
      message: 'User address fetched successfully',
      user: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

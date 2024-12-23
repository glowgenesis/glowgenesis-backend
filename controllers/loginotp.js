const bcrypt = require('bcrypt');
const axios = require('axios'); // For sending requests to Meta API
const otpGenerator = require('otp-generator'); // For generating OTPs
const loginotpschema = require('../models/loginotpschema');

// This will temporarily store OTPs. For production, use a database like Redis for better scalability.
const otpStore = {};

// Function to send OTP via Meta's WhatsApp API
const sendOtpOnWhatsApp = async (phoneNumber, otp) => {
  const metaApiUrl = 'https://graph.facebook.com/v16.0/544344255421377/messages';
  const metaAccessToken = 'EAAFk67MJr0IBO4GeTUIoaEmwHXodmZBQRdGzTynHEJIqCxwBkJ5cSj1cRAr3e2sbxZCjz82PLrTBc53ZAZA0hhpdTMnNrOROq4IOj4oAYjY4iFotDoZBsHwTZBNhwvcZAYb31vkHZC69h1lGer3jamK6nXhMWK8tZCP7ZCHNiNBHKz4hukZBYGb5BMJNmLzHGZBAM9Ojlj9OdEVZCMrLYD8M9ZBlGJG64rDWtctz93SFYYSPE0Yq45';

  try {
    await axios.post(
      metaApiUrl,
      {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'template',
        template: {
          name: 'verification ', // Replace with your WhatsApp template name
          language: { code: 'en_US' },
          components: [
            {
              type: 'body',
              parameters: [ { type: 'text', text: otp },],
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${metaAccessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(`OTP sent to ${phoneNumber}`);
  } catch (error) {
    console.error('Error sending OTP:', error.response?.data || error.message);
    throw new Error('Failed to send OTP');
  }
};

// Login or Register
exports.loginOrRegister = async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) return res.status(400).json({ message: 'Phone number is required' });

  try {
    // Generate OTP
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });

    // Send OTP via WhatsApp
    await sendOtpOnWhatsApp(phoneNumber, otp);

    // Store OTP temporarily
    otpStore[phoneNumber] = { otp, createdAt: Date.now() };

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  const { phoneNumber, otp } = req.body;

  if (!phoneNumber || !otp) return res.status(400).json({ message: 'Phone number and OTP are required' });

  const storedOtpData = otpStore[phoneNumber];
  if (!storedOtpData) return res.status(400).json({ message: 'OTP expired or not found' });

  const { otp: storedOtp, createdAt } = storedOtpData;

  // OTP validity: 5 minutes
  const isOtpValid = storedOtp === otp && Date.now() - createdAt <= 5 * 60 * 1000;

  if (!isOtpValid) return res.status(401).json({ message: 'Invalid or expired OTP' });

  try {
    // Check if user already exists
    let user = await loginotpschema.findOne({ phoneNumber });

    if (!user) {
      // Register the user
      user = await LoginotpSchema.create({ phoneNumber });
    }

    // Successful login
    res.status(200).json({ message: 'Login successful', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    // Clean up the OTP after verification
    delete otpStore[phoneNumber];
  }
};


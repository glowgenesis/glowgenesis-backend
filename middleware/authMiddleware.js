const jwt = require('jsonwebtoken');
const loginotpschema = require('../models/loginotpschema');

const auth = async (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, 'your-secret-key');
    const user = await loginotpschema.findById(decoded.id);

    if (!user || user.token !== token) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

module.exports = auth;

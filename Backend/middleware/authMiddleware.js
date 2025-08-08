// Backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/users'); // User model

const protect = async (req, res, next) => {
  let token;

  // 1. Check if Authorization header exists and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token using JWT_SECRET from .env
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by ID from token and attach to request object (req.user)
      req.user = await User.findById(decoded.id).select('-password'); // Don't return password
      
      // If everything is successful, proceed to the next middleware/controller
      next(); 
    } catch (error) {
      // If token verification fails (e.g., malformed, expired, invalid signature)
      console.error("Token verification failed:", error); // Log the specific JWT error
      res.status(401).json({ message: 'مجاز نیست، توکن نامعتبر یا منقضی شده است.' });
    }
  } else {
    // 2. If no token is provided in the correct format
    res.status(401).json({ message: 'مجاز نیست، توکن احراز هویت یافت نشد.' });
  }
};

module.exports = { protect };

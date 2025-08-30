const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes - requires valid JWT token
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          error: true,
          message: 'User not found'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          error: true,
          message: 'User account is deactivated'
        });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        error: true,
        message: 'Invalid token'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      error: true,
      message: 'Access denied. No token provided.'
    });
  }
};

// Middleware to check if user is admin
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res.status(403).json({
      error: true,
      message: 'Access denied. Admin privileges required.'
    });
  }
};

// Middleware to check if user owns the resource or is admin
const authorize = (resourceUserId) => {
  return (req, res, next) => {
    if (req.user.isAdmin || req.user._id.toString() === resourceUserId.toString()) {
      next();
    } else {
      return res.status(403).json({
        error: true,
        message: 'Access denied. You can only modify your own resources.'
      });
    }
  };
};

// Middleware to check if user is verified
const verified = (req, res, next) => {
  if (req.user && req.user.isVerified) {
    next();
  } else {
    return res.status(403).json({
      error: true,
      message: 'Account verification required. Please verify your email address.'
    });
  }
};

// Optional authentication - doesn't fail if no token, but adds user if valid
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Silently fail for optional auth
      console.log('Optional auth failed:', error.message);
    }
  }
  
  next();
};

// Rate limiting for authentication attempts
const authRateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
};

module.exports = {
  protect,
  admin,
  authorize,
  verified,
  optionalAuth,
  authRateLimit
};

const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    console.log('🔐 Auth middleware - checking request:', {
      method: req.method,
      url: req.url,
      hasAuthHeader: !!req.header('Authorization')
    });
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ Auth middleware - no token provided');
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    console.log('🔑 Auth middleware - token found, validating...');

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key');
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    if (user.status !== 'active') {
      return res.status(401).json({ error: 'Account is not active.' });
    }

    req.user = user;
    console.log('✅ Auth middleware - user authenticated:', {
      id: user.id,
      username: user.username,
      role: user.role
    });
    next();
  } catch (error) {
    console.log('❌ Auth middleware - error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    res.status(500).json({ error: 'Authentication error.' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied. Insufficient permissions.' 
      });
    }
    next();
  };
};

module.exports = { auth, authorize };

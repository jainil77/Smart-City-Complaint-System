const jwt = require('jsonwebtoken');
const User = require('../Models/User');
require('dotenv').config();

const protect = async (req, res, next) => {
  let token;

  // 1. Read the token from the cookie
  token = req.cookies.token;

  if (token) {
    try {
      // 2. Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Get user from the token's payload (ID)
      req.user = await User.findById(decoded.id).select('-password');

      if (req.user && req.user.isBlocked) {
        return res.status(403).json({ message: 'Your account has been blocked.' }); // 403 Forbidden
      }
      
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  // Allow if the user is an 'admin' OR a 'superadmin'
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized. Admin or Super Admin access required.' });
  }
};

const superAdmin = (req, res, next) => {
  // This middleware MUST run *after* 'protect', so req.user will exist.
  if (req.user && req.user.role === 'superadmin') {
    next(); // User is a Super Admin, proceed.
  } else {
    res.status(403).json({ message: 'Not authorized as a Super Admin.' });
  }
};

const partner = (req, res, next) => {
  if (req.user && req.user.role === 'partner') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a partner' });
  }
};

module.exports = { protect ,admin,superAdmin,partner};
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Shop = require('../models/Shop');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login with a valid token.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_food_platform_key_12345');

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Account associated with token no longer exists.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid or malformed authentication token.',
    });
  }
};

// Check for specific roles (e.g. authorize('admin', 'shop_owner'))
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${roles.join(', ')}]. Your role is ${req.user.role}.`,
      });
    }

    next();
  };
};

// Verify shop ownership for shop owners or super admins
const verifyShopOwnership = async (req, res, next) => {
  try {
    const shopId = req.params.shopId || req.body.shopId || req.query.shopId;
    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: 'Shop ID is required for verification.',
      });
    }

    // Admins have platform-wide access
    if (req.user.role === 'admin') {
      const shop = await Shop.findById(shopId);
      if (!shop) {
        return res.status(404).json({ success: false, message: 'Shop not found.' });
      }
      req.shop = shop;
      return next();
    }

    // Shop owners must own the shop
    if (req.user.role === 'shop_owner') {
      const shop = await Shop.findOne({ _id: shopId, owner: req.user._id });
      if (!shop) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You do not own this shop.',
        });
      }
      req.shop = shop;
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied: Only shop owners or admins can perform this action.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  authenticate,
  authorize,
  verifyShopOwnership,
};

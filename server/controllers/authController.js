const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Shop = require('../models/Shop');
const DeliveryPartnerProfile = require('../models/DeliveryPartnerProfile');

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'dev_secret_food_platform_key_12345',
    { expiresIn: '7d' }
  );
};

// @desc    Register a new customer
// @route   POST /api/auth/register-customer
// @access  Public
const registerCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: 'customer',
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a shop owner with their shop
// @route   POST /api/auth/register-shop-owner
// @access  Public
const registerShopOwner = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      shopName,
      category,
      description,
      logo,
      coverImage,
      street,
      city,
      state,
      postalCode,
      deliveryChargePaise,
      minOrderAmountPaise,
      freeDeliveryThresholdPaise,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // 1. Create shop owner user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: 'shop_owner',
    });

    // 2. Create the shop with pending status
    const shop = await Shop.create({
      owner: user._id,
      name: shopName,
      slug: shopName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      category,
      description: description || '',
      logo: logo || undefined,
      coverImage: coverImage || undefined,
      address: {
        street,
        city,
        state: state || '',
        postalCode,
      },
      phone,
      email,
      deliveryChargePaise: deliveryChargePaise !== undefined ? deliveryChargePaise : 4000,
      minOrderAmountPaise: minOrderAmountPaise !== undefined ? minOrderAmountPaise : 0,
      freeDeliveryThresholdPaise: freeDeliveryThresholdPaise !== undefined ? freeDeliveryThresholdPaise : 50000,
      approvalStatus: 'pending', // Pending approval by Super Admin
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Registration submitted! Your shop is pending Super Admin review.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      shop: {
        _id: shop._id,
        name: shop.name,
        category: shop.category,
        approvalStatus: shop.approvalStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user (any role)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact platform support.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const token = generateToken(user._id, user.role);

    // Fetch related role data
    let extraData = {};
    if (user.role === 'shop_owner') {
      const shop = await Shop.findOne({ owner: user._id });
      extraData.shop = shop;
    } else if (user.role === 'delivery_partner') {
      const profile = await DeliveryPartnerProfile.findOne({ user: user._id }).populate('shop', 'name address phone');
      extraData.deliveryProfile = profile;
    }

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
      },
      ...extraData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    let extraData = {};

    if (user.role === 'shop_owner') {
      const shop = await Shop.findOne({ owner: user._id });
      extraData.shop = shop;
    } else if (user.role === 'delivery_partner') {
      const profile = await DeliveryPartnerProfile.findOne({ user: user._id }).populate('shop', 'name address phone');
      extraData.deliveryProfile = profile;
    }

    res.json({
      success: true,
      user,
      ...extraData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerCustomer,
  registerShopOwner,
  login,
  getMe,
};

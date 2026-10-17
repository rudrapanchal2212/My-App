const Shop = require('../models/Shop');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const DeliveryPartnerProfile = require('../models/DeliveryPartnerProfile');
const Notification = require('../models/Notification');
const { formatPaiseToINR } = require('../utils/currency');

// @desc    Get owner's shop and dashboard statistics
// @route   GET /api/shops/my-shop
// @access  Private (Shop Owner)
const getMyShop = async (req, res, next) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'No shop found for this account.',
      });
    }

    // Calculate start of today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      totalProducts,
      totalOrders,
      todayOrders,
      pendingOrders,
      completedOrders,
      deliveryPartnersCount,
      ordersAggregate,
    ] = await Promise.all([
      Product.countDocuments({ shop: shop._id }),
      Order.countDocuments({ shop: shop._id }),
      Order.countDocuments({ shop: shop._id, createdAt: { $gte: startOfToday } }),
      Order.countDocuments({ shop: shop._id, status: 'pending' }),
      Order.countDocuments({ shop: shop._id, status: 'delivered' }),
      DeliveryPartnerProfile.countDocuments({ shop: shop._id }),
      Order.aggregate([
        { $match: { shop: shop._id, status: 'delivered' } },
        { $group: { _id: null, totalRevenuePaise: { $sum: '$totalPaise' } } },
      ]),
    ]);

    const totalRevenuePaise = ordersAggregate[0]?.totalRevenuePaise || 0;

    res.json({
      success: true,
      shop,
      stats: {
        totalProducts,
        totalOrders,
        todayOrders,
        pendingOrders,
        completedOrders,
        deliveryPartnersCount,
        totalRevenuePaise,
        formattedRevenue: formatPaiseToINR(totalRevenuePaise),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update owner's shop details & delivery settings
// @route   PUT /api/shops/my-shop
// @access  Private (Shop Owner)
const updateMyShop = async (req, res, next) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    const {
      name,
      description,
      category,
      logo,
      coverImage,
      street,
      city,
      state,
      postalCode,
      phone,
      email,
      isOperating,
      operatingHours,
      estimatedDeliveryTime,
      minOrderAmountPaise,
      deliveryChargePaise,
      freeDeliveryThresholdPaise,
    } = req.body;

    if (name) shop.name = name;
    if (description !== undefined) shop.description = description;
    if (category) shop.category = category;
    if (logo) shop.logo = logo;
    if (coverImage) shop.coverImage = coverImage;
    if (phone) shop.phone = phone;
    if (email) shop.email = email;
    if (isOperating !== undefined) shop.isOperating = isOperating;
    if (operatingHours) shop.operatingHours = operatingHours;
    if (estimatedDeliveryTime) shop.estimatedDeliveryTime = estimatedDeliveryTime;

    if (street || city || state || postalCode) {
      shop.address = {
        street: street || shop.address.street,
        city: city || shop.address.city,
        state: state !== undefined ? state : shop.address.state,
        postalCode: postalCode || shop.address.postalCode,
      };
    }

    // Owner independently controls prices and delivery rules
    if (minOrderAmountPaise !== undefined) shop.minOrderAmountPaise = minOrderAmountPaise;
    if (deliveryChargePaise !== undefined) shop.deliveryChargePaise = deliveryChargePaise;
    if (freeDeliveryThresholdPaise !== undefined) shop.freeDeliveryThresholdPaise = freeDeliveryThresholdPaise;

    await shop.save();

    res.json({
      success: true,
      message: 'Shop settings updated successfully.',
      shop,
    });
  } catch (error) {
    next(error);
  }
};

// ================= PRODUCT MANAGEMENT ================= //

// @desc    Get all products for owner's shop
// @route   GET /api/shops/my-shop/products
// @access  Private (Shop Owner)
const getOwnerProducts = async (req, res, next) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    const products = await Product.find({ shop: shop._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a product to owner's shop
// @route   POST /api/shops/my-shop/products
// @access  Private (Shop Owner)
const addProduct = async (req, res, next) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    const {
      name,
      description,
      category,
      image,
      pricePaise,
      originalPricePaise,
      stockQuantity,
      isAvailable,
      options,
    } = req.body;

    let discountPercentage = 0;
    if (originalPricePaise && originalPricePaise > pricePaise) {
      discountPercentage = Math.round(((originalPricePaise - pricePaise) / originalPricePaise) * 100);
    }

    const product = await Product.create({
      shop: shop._id,
      name,
      description: description || '',
      category,
      image: image || undefined,
      pricePaise,
      originalPricePaise: originalPricePaise || pricePaise,
      discountPercentage,
      stockQuantity: stockQuantity !== undefined ? stockQuantity : 50,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      options: options || [],
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully!',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product in owner's shop
// @route   PUT /api/shops/my-shop/products/:productId
// @access  Private (Shop Owner)
const updateProduct = async (req, res, next) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    const product = await Product.findOne({ _id: req.params.productId, shop: shop._id });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or does not belong to your shop.',
      });
    }

    const {
      name,
      description,
      category,
      image,
      pricePaise,
      originalPricePaise,
      stockQuantity,
      isAvailable,
      options,
    } = req.body;

    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (category) product.category = category;
    if (image) product.image = image;
    if (pricePaise !== undefined) product.pricePaise = pricePaise;
    if (originalPricePaise !== undefined) product.originalPricePaise = originalPricePaise;
    if (stockQuantity !== undefined) product.stockQuantity = stockQuantity;
    if (isAvailable !== undefined) product.isAvailable = isAvailable;
    if (options !== undefined) product.options = options;

    if (product.originalPricePaise > product.pricePaise) {
      product.discountPercentage = Math.round(
        ((product.originalPricePaise - product.pricePaise) / product.originalPricePaise) * 100
      );
    } else {
      product.discountPercentage = 0;
    }

    await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully.',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product from owner's shop
// @route   DELETE /api/shops/my-shop/products/:productId
// @access  Private (Shop Owner)
const deleteProduct = async (req, res, next) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    const product = await Product.findOneAndDelete({ _id: req.params.productId, shop: shop._id });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or does not belong to your shop.',
      });
    }

    res.json({
      success: true,
      message: 'Product removed from your catalog.',
    });
  } catch (error) {
    next(error);
  }
};

// ================= DELIVERY PARTNER MANAGEMENT ================= //

// @desc    Get delivery partners managed by this shop
// @route   GET /api/shops/my-shop/delivery-partners
// @access  Private (Shop Owner)
const getShopDeliveryPartners = async (req, res, next) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    const partners = await DeliveryPartnerProfile.find({ shop: shop._id })
      .populate('user', 'name email phone avatar isActive')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      partners,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new delivery partner under this shop
// @route   POST /api/shops/my-shop/delivery-partners
// @access  Private (Shop Owner)
const createDeliveryPartner = async (req, res, next) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    const {
      name,
      email,
      phone,
      password,
      vehicleType,
      vehicleNumber,
      drivingLicenseNumber,
      photoUrl,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Create user with delivery_partner role
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: 'delivery_partner',
      avatar: photoUrl || '',
    });

    // Create delivery partner profile linked to this shop and owner
    const profile = await DeliveryPartnerProfile.create({
      user: user._id,
      shop: shop._id,
      owner: req.user._id,
      vehicleType: vehicleType || 'Bike',
      vehicleNumber: vehicleNumber || '',
      drivingLicenseNumber: drivingLicenseNumber || '',
      photoUrl: photoUrl || '',
      approvalStatus: 'approved', // Active under owner's fleet
      isAvailable: true,
    });

    res.status(201).json({
      success: true,
      message: 'Delivery partner registered successfully!',
      partner: {
        profile,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ================= ORDER WORKFLOW MANAGEMENT ================= //

// @desc    Get orders for owner's shop
// @route   GET /api/shops/my-shop/orders
// @access  Private (Shop Owner)
const getShopOrders = async (req, res, next) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    const { status } = req.query;
    const filter = { shop: shop._id };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate('customer', 'name email phone')
      .populate('deliveryPartner', 'name phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept an order
// @route   PUT /api/shops/my-shop/orders/:orderId/accept
// @access  Private (Shop Owner)
const acceptOrder = async (req, res, next) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    const order = await Order.findOne({ _id: req.params.orderId, shop: shop._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot accept order. Current status is '${order.status}'.`,
      });
    }

    order.status = 'accepted';
    order.statusHistory.push({
      status: 'accepted',
      timestamp: new Date(),
      updatedBy: req.user._id,
      note: 'Order accepted by shop.',
    });

    await order.save();

    // Notify customer
    await Notification.create({
      recipient: order.customer,
      title: 'Order Confirmed!',
      message: `Your order #${order.orderNumber} has been accepted by ${shop.name}.`,
      type: 'order',
    });

    res.json({
      success: true,
      message: 'Order accepted.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject an incoming order
// @route   PUT /api/shops/my-shop/orders/:orderId/reject
// @access  Private (Shop Owner)
const rejectOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const shop = await Shop.findOne({ owner: req.user._id });
    const order = await Order.findOne({ _id: req.params.orderId, shop: shop._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject order in status '${order.status}'.`,
      });
    }

    order.status = 'rejected';
    order.rejectionReason = reason || 'Shop is unable to fulfill this order at this time.';
    order.statusHistory.push({
      status: 'rejected',
      timestamp: new Date(),
      updatedBy: req.user._id,
      note: order.rejectionReason,
    });

    // Restore stock quantities
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stockQuantity: item.quantity },
      });
    }

    await order.save();

    // Notify customer
    await Notification.create({
      recipient: order.customer,
      title: 'Order Cancelled by Shop',
      message: `Your order #${order.orderNumber} was declined by ${shop.name}. Reason: ${order.rejectionReason}`,
      type: 'order',
    });

    res.json({
      success: true,
      message: 'Order rejected and stock restored.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order preparation status ('preparing' or 'ready_for_pickup')
// @route   PUT /api/shops/my-shop/orders/:orderId/status
// @access  Private (Shop Owner)
const updatePreparationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['preparing', 'ready_for_pickup'];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status update. Allowed values: ${allowed.join(', ')}`,
      });
    }

    const shop = await Shop.findOne({ owner: req.user._id });
    const order = await Order.findOne({ _id: req.params.orderId, shop: shop._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      updatedBy: req.user._id,
      note: status === 'preparing' ? 'Food / grocery items are being prepared.' : 'Order is packed and ready for pickup.',
    });

    await order.save();

    res.json({
      success: true,
      message: `Order status updated to ${status}.`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign order to an approved delivery partner
// @route   PUT /api/shops/my-shop/orders/:orderId/assign-partner
// @access  Private (Shop Owner)
const assignDeliveryPartner = async (req, res, next) => {
  try {
    const { partnerId } = req.body;
    const shop = await Shop.findOne({ owner: req.user._id });
    const order = await Order.findOne({ _id: req.params.orderId, shop: shop._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify partner belongs to this shop and is active
    const profile = await DeliveryPartnerProfile.findOne({
      _id: partnerId,
      shop: shop._id,
      approvalStatus: 'approved',
    }).populate('user');

    if (!profile) {
      return res.status(400).json({
        success: false,
        message: 'Delivery partner not found, not approved, or not linked to your shop.',
      });
    }

    order.deliveryPartner = profile.user._id;
    order.statusHistory.push({
      status: order.status,
      timestamp: new Date(),
      updatedBy: req.user._id,
      note: `Assigned to delivery partner ${profile.user.name}.`,
    });

    await order.save();

    // Notify delivery partner
    await Notification.create({
      recipient: profile.user._id,
      title: 'New Delivery Assigned! 🛵',
      message: `You have been assigned order #${order.orderNumber} for pickup at ${shop.name}.`,
      type: 'delivery',
    });

    res.json({
      success: true,
      message: `Order assigned to ${profile.user.name}.`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyShop,
  updateMyShop,
  getOwnerProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getShopDeliveryPartners,
  createDeliveryPartner,
  getShopOrders,
  acceptOrder,
  rejectOrder,
  updatePreparationStatus,
  assignDeliveryPartner,
};

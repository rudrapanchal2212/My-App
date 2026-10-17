const Shop = require('../models/Shop');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Address = require('../models/Address');
const Review = require('../models/Review');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const { formatPaiseToINR } = require('../utils/currency');

// @desc    Get all approved public shops
// @route   GET /api/shops/public
// @access  Public
const getPublicShops = async (req, res, next) => {
  try {
    const { category, search, city } = req.query;
    // Only approved shops can appear in public marketplace!
    const filter = { approvalStatus: 'approved' };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (city) {
      filter['address.city'] = { $regex: city, $options: 'i' };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const shops = await Shop.find(filter)
      .select('-documents')
      .sort({ rating: -1, createdAt: -1 });

    res.json({
      success: true,
      count: shops.length,
      shops,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get shop details and catalog for customer
// @route   GET /api/shops/public/:id
// @access  Public
const getPublicShopDetails = async (req, res, next) => {
  try {
    const shop = await Shop.findOne({ _id: req.params.id, approvalStatus: 'approved' }).select('-documents');
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found or is currently not approved.',
      });
    }

    const products = await Product.find({ shop: shop._id, isAvailable: true }).sort({ category: 1, name: 1 });
    const reviews = await Review.find({ shop: shop._id }).populate('customer', 'name avatar').sort({ createdAt: -1 }).limit(10);

    res.json({
      success: true,
      shop,
      products,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// ================= ADDRESS MANAGEMENT ================= //

// @desc    Get customer addresses
// @route   GET /api/addresses
// @access  Private (Customer)
const getCustomerAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ customer: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    res.json({ success: true, addresses });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a delivery address
// @route   POST /api/addresses
// @access  Private (Customer)
const addCustomerAddress = async (req, res, next) => {
  try {
    const { label, street, apartment, city, state, postalCode, contactPhone, isDefault } = req.body;

    if (postalCode && postalCode.trim() !== '389172') {
      return res.status(400).json({
        success: false,
        message: 'Delivery is available exclusively within Fatepura (PIN: 389172), Gujarat.',
      });
    }

    if (isDefault) {
      // Unset previous default
      await Address.updateMany({ customer: req.user._id }, { isDefault: false });
    }

    const count = await Address.countDocuments({ customer: req.user._id });
    const address = await Address.create({
      customer: req.user._id,
      label: label || 'Home',
      street,
      apartment: apartment || '',
      city: city || 'Fatepura',
      state: state || 'Gujarat',
      postalCode: '389172',
      contactPhone,
      isDefault: isDefault || count === 0, // First address is default automatically
    });

    res.status(201).json({
      success: true,
      message: 'Address saved.',
      address,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a delivery address
// @route   DELETE /api/addresses/:id
// @access  Private (Customer)
const deleteCustomerAddress = async (req, res, next) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, customer: req.user._id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found.' });
    }
    res.json({ success: true, message: 'Address removed.' });
  } catch (error) {
    next(error);
  }
};

// ================= ORDER PLACEMENT & LIFECYCLE ================= //

// @desc    Place a new order
// @route   POST /api/orders
// @access  Private (Customer)
const createOrder = async (req, res, next) => {
  try {
    const { shopId, items, addressId, deliveryAddress, specialInstructions, paymentMethod } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Your cart is empty.' });
    }

    // 1. Verify Shop exists, is approved, and is operating
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop does not exist.' });
    }

    if (shop.approvalStatus !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'This shop is currently not approved to accept orders.',
      });
    }

    if (!shop.isOperating) {
      return res.status(400).json({
        success: false,
        message: 'This shop is currently closed. Please try again during operating hours.',
      });
    }

    // 2. Resolve Delivery Address
    let targetAddress = deliveryAddress;
    if (addressId) {
      const savedAddr = await Address.findOne({ _id: addressId, customer: req.user._id });
      if (savedAddr) {
        targetAddress = {
          label: savedAddr.label,
          street: savedAddr.street,
          apartment: savedAddr.apartment,
          city: savedAddr.city,
          state: savedAddr.state,
          postalCode: savedAddr.postalCode,
          contactPhone: savedAddr.contactPhone,
        };
      }
    }

    if (!targetAddress || !targetAddress.street || !targetAddress.contactPhone) {
      return res.status(400).json({
        success: false,
        message: 'A valid customer house street/faliyu address and contact phone number are required.',
      });
    }

    // Strict Delivery Zone: Fatepura (389172), Gujarat ONLY
    if (targetAddress.postalCode && targetAddress.postalCode.toString().trim() !== '389172') {
      return res.status(400).json({
        success: false,
        message: 'Delivery Zone Restriction: QuickBite currently delivers exclusively within Fatepura (PIN: 389172), Gujarat. We cannot deliver outside this area.',
      });
    }

    // Normalize city and state to Fatepura, Gujarat
    targetAddress.city = 'Fatepura';
    targetAddress.state = 'Gujarat';
    targetAddress.postalCode = '389172';

    // 3. Validate items, pricing, and stock on backend
    let subtotalPaise = 0;
    const itemSnapshots = [];

    for (const item of items) {
      const product = await Product.findOne({ _id: item.productId, shop: shop._id });
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.productId} was not found in this shop.`,
        });
      }

      if (!product.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `Product "${product.name}" is currently unavailable.`,
        });
      }

      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stockQuantity} units left for "${product.name}".`,
        });
      }

      const itemTotalPaise = product.pricePaise * item.quantity;
      subtotalPaise += itemTotalPaise;

      itemSnapshots.push({
        productId: product._id,
        name: product.name,
        image: product.image,
        unitPricePaise: product.pricePaise,
        quantity: item.quantity,
        totalPricePaise: itemTotalPaise,
        selectedOptions: item.selectedOptions || [],
      });
    }

    // 4. Minimum order check
    if (shop.minOrderAmountPaise && subtotalPaise < shop.minOrderAmountPaise) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount for this shop is ${formatPaiseToINR(shop.minOrderAmountPaise)}. Current subtotal: ${formatPaiseToINR(subtotalPaise)}.`,
      });
    }

    // 5. Calculate delivery fee according to shop rules
    let deliveryChargePaise = shop.deliveryChargePaise || 0;
    if (shop.freeDeliveryThresholdPaise > 0 && subtotalPaise >= shop.freeDeliveryThresholdPaise) {
      deliveryChargePaise = 0; // Free delivery threshold achieved
    }

    const discountPaise = 0;
    const totalPaise = subtotalPaise - discountPaise + deliveryChargePaise;

    // 6. Deduct stock atomically
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stockQuantity: -item.quantity },
      });
    }

    // 7. Generate unique order number
    const datePrefix = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${datePrefix}-${randomSuffix}`;

    // 8. Create Order
    const order = await Order.create({
      orderNumber,
      customer: req.user._id,
      shop: shop._id,
      items: itemSnapshots,
      subtotalPaise,
      discountPaise,
      deliveryChargePaise,
      totalPaise,
      paymentMethod: paymentMethod || 'cash_on_delivery',
      paymentStatus: 'pending',
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          timestamp: new Date(),
          updatedBy: req.user._id,
          note: 'Order placed by customer.',
        },
      ],
      deliveryAddress: targetAddress,
      specialInstructions: specialInstructions || '',
      estimatedDeliveryTime: shop.estimatedDeliveryTime || '30-40 mins',
    });

    // Notify shop owner
    await Notification.create({
      recipient: shop.owner,
      title: 'New Order Received! 🔔',
      message: `You received order #${order.orderNumber} for ${formatPaiseToINR(totalPaise)}.`,
      type: 'order',
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer's order history
// @route   GET /api/orders/my-orders
// @access  Private (Customer)
const getCustomerOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('shop', 'name logo phone address category')
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

// @desc    Get order details
// @route   GET /api/orders/:id
// @access  Private (Customer / Shop Owner / Delivery Partner / Admin)
const getOrderDetails = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('shop', 'name phone address logo coverImage category')
      .populate('deliveryPartner', 'name phone avatar');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Role-based access control
    const isCustomer = order.customer._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isDeliveryPartner = order.deliveryPartner && order.deliveryPartner._id.toString() === req.user._id.toString();
    
    // For shop owner, check ownership
    let isShopOwner = false;
    if (req.user.role === 'shop_owner') {
      const shop = await Shop.findOne({ _id: order.shop._id, owner: req.user._id });
      if (shop) isShopOwner = true;
    }

    if (!isCustomer && !isAdmin && !isShopOwner && !isDeliveryPartner) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view this order.',
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order (Customer can cancel ONLY when status is 'pending' before shop acceptance)
// @route   PUT /api/orders/:id/cancel
// @access  Private (Customer)
const cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findOne({ _id: req.params.id, customer: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Strict rule: Once accepted by shop owner, customer CANNOT cancel order
    if (order.status !== 'pending') {
      if (['accepted', 'preparing', 'ready_for_pickup', 'out_for_delivery'].includes(order.status)) {
        return res.status(400).json({
          success: false,
          message: 'Order cannot be cancelled after it has been accepted by the shop. The kitchen/shop is already preparing your order.',
        });
      }
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled. Order is already '${order.status}'.`,
      });
    }

    order.status = 'cancelled';
    order.cancellationReason = reason || 'Cancelled by customer.';
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      updatedBy: req.user._id,
      note: order.cancellationReason,
    });

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stockQuantity: item.quantity },
      });
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully and items restored.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// ================= REVIEWS & COMPLAINTS ================= //

// @desc    Submit review for completed order
// @route   POST /api/reviews
// @access  Private (Customer)
const createReview = async (req, res, next) => {
  try {
    const { orderId, rating, comment } = req.body;

    const order = await Order.findOne({ _id: orderId, customer: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'You can only review orders that have been successfully delivered.',
      });
    }

    const existing = await Review.findOne({ order: orderId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this order.',
      });
    }

    const review = await Review.create({
      order: order._id,
      customer: req.user._id,
      shop: order.shop,
      rating: Number(rating),
      comment: comment || '',
    });

    // Recalculate average shop rating
    const stats = await Review.aggregate([
      { $match: { shop: order.shop } },
      { $group: { _id: null, avgRating: { $sum: '$rating' }, count: { $sum: 1 } } },
    ]);

    if (stats.length) {
      const avg = stats[0].avgRating / stats[0].count;
      await Shop.findByIdAndUpdate(order.shop, {
        rating: Math.round(avg * 10) / 10,
        ratingCount: stats[0].count,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for your review!',
      review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit a complaint
// @route   POST /api/complaints
// @access  Private (Customer)
const createComplaint = async (req, res, next) => {
  try {
    const { orderId, subject, message } = req.body;

    const order = await Order.findOne({ _id: orderId, customer: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const complaint = await Complaint.create({
      order: order._id,
      customer: req.user._id,
      shop: order.shop,
      subject,
      message,
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted to Platform Support. We will investigate promptly.',
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicShops,
  getPublicShopDetails,
  getCustomerAddresses,
  addCustomerAddress,
  deleteCustomerAddress,
  createOrder,
  getCustomerOrders,
  getOrderDetails,
  cancelOrder,
  createReview,
  createComplaint,
};

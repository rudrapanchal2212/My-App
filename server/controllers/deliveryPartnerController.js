const Order = require('../models/Order');
const DeliveryPartnerProfile = require('../models/DeliveryPartnerProfile');
const Notification = require('../models/Notification');
const { formatPaiseToINR } = require('../utils/currency');

// @desc    Get dashboard metrics & assigned orders for delivery partner
// @route   GET /api/delivery-partners/my-deliveries
// @access  Private (Delivery Partner)
const getMyDeliveries = async (req, res, next) => {
  try {
    const profile = await DeliveryPartnerProfile.findOne({ user: req.user._id }).populate('shop', 'name address phone');
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Delivery partner profile not found.',
      });
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [activeOrders, completedOrders, todayDeliveries] = await Promise.all([
      Order.find({
        deliveryPartner: req.user._id,
        status: { $in: ['ready_for_pickup', 'accepted', 'preparing', 'out_for_delivery'] },
      })
        .populate('customer', 'name phone')
        .populate('shop', 'name address phone')
        .sort({ createdAt: -1 }),
      Order.find({
        deliveryPartner: req.user._id,
        status: 'delivered',
      })
        .populate('customer', 'name phone')
        .populate('shop', 'name address phone')
        .sort({ updatedAt: -1 })
        .limit(20),
      Order.countDocuments({
        deliveryPartner: req.user._id,
        status: 'delivered',
        deliveredAt: { $gte: startOfToday },
      }),
    ]);

    // Calculate cash collected today
    const cashStats = await Order.aggregate([
      {
        $match: {
          deliveryPartner: req.user._id,
          status: 'delivered',
          deliveredAt: { $gte: startOfToday },
        },
      },
      {
        $group: {
          _id: null,
          totalCashCollectedPaise: { $sum: '$totalPaise' },
        },
      },
    ]);

    const cashTodayPaise = cashStats[0]?.totalCashCollectedPaise || 0;

    res.json({
      success: true,
      profile,
      stats: {
        activeCount: activeOrders.length,
        todayDeliveries,
        totalCompleted: profile.totalDeliveries,
        cashCollectedTodayPaise: cashTodayPaise,
        formattedCashToday: formatPaiseToINR(cashTodayPaise),
      },
      activeOrders,
      completedOrders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark order as Picked Up (Out for Delivery)
// @route   PUT /api/delivery-partners/orders/:orderId/pickup
// @access  Private (Delivery Partner)
const markOrderPickedUp = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      deliveryPartner: req.user._id,
    }).populate('shop', 'name');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not assigned to you.',
      });
    }

    if (order.status === 'out_for_delivery') {
      return res.status(400).json({ success: false, message: 'Order is already out for delivery.' });
    }

    order.status = 'out_for_delivery';
    order.statusHistory.push({
      status: 'out_for_delivery',
      timestamp: new Date(),
      updatedBy: req.user._id,
      note: 'Order picked up by delivery partner and is out for delivery.',
    });

    await order.save();

    // Notify customer
    await Notification.create({
      recipient: order.customer,
      title: 'Order Out for Delivery! 🛵',
      message: `Your order #${order.orderNumber} is on the way with your delivery partner!`,
      type: 'delivery',
    });

    res.json({
      success: true,
      message: 'Order marked as Out for Delivery.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark order as Delivered (Cash collected)
// @route   PUT /api/delivery-partners/orders/:orderId/deliver
// @access  Private (Delivery Partner)
const markOrderDelivered = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      deliveryPartner: req.user._id,
    }).populate('shop', 'name');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not assigned to you.',
      });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({ success: false, message: 'Order is already delivered.' });
    }

    order.status = 'delivered';
    order.paymentStatus = 'paid'; // Cash on delivery collected
    order.deliveredAt = new Date();
    order.statusHistory.push({
      status: 'delivered',
      timestamp: new Date(),
      updatedBy: req.user._id,
      note: 'Order successfully delivered and cash payment collected.',
    });

    await order.save();

    // Increment partner total deliveries
    await DeliveryPartnerProfile.findOneAndUpdate(
      { user: req.user._id },
      { $inc: { totalDeliveries: 1 } }
    );

    // Notify customer
    await Notification.create({
      recipient: order.customer,
      title: 'Order Delivered! 🍽️',
      message: `Your order #${order.orderNumber} has been delivered. Enjoy your meal!`,
      type: 'order',
    });

    res.json({
      success: true,
      message: 'Order marked as Delivered successfully.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyDeliveries,
  markOrderPickedUp,
  markOrderDelivered,
};

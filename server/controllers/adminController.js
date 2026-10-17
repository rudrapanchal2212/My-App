const User = require('../models/User');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const Order = require('../models/Order');
const DeliveryPartnerProfile = require('../models/DeliveryPartnerProfile');
const Complaint = require('../models/Complaint');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const { formatPaiseToINR } = require('../utils/currency');

// Helper to log administrative actions
const recordAuditLog = async ({ adminId, action, targetType, targetId, targetName, details, req }) => {
  try {
    await AuditLog.create({
      admin: adminId,
      action,
      targetType,
      targetId,
      targetName: targetName || '',
      details: details || {},
      ipAddress: req?.ip || req?.connection?.remoteAddress || '',
      userAgent: req?.headers?.['user-agent'] || '',
    });
  } catch (error) {
    console.error('Failed to record audit log:', error);
  }
};

// @desc    Get Super Admin platform dashboard analytics
// @route   GET /api/admin/dashboard-stats
// @access  Private (Super Admin)
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalCustomers,
      totalShops,
      pendingShops,
      approvedShops,
      rejectedShops,
      suspendedShops,
      pendingPartners,
      totalPartners,
      ordersAggregate,
      recentOrders,
      recentShops,
      openComplaints,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Shop.countDocuments(),
      Shop.countDocuments({ approvalStatus: 'pending' }),
      Shop.countDocuments({ approvalStatus: 'approved' }),
      Shop.countDocuments({ approvalStatus: 'rejected' }),
      Shop.countDocuments({ approvalStatus: 'suspended' }),
      DeliveryPartnerProfile.countDocuments({ approvalStatus: 'pending' }),
      DeliveryPartnerProfile.countDocuments(),
      Order.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalPaise: { $sum: '$totalPaise' },
          },
        },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('customer', 'name email phone')
        .populate('shop', 'name category'),
      Shop.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('owner', 'name email phone'),
      Complaint.countDocuments({ status: 'open' }),
    ]);

    // Parse order metrics
    let totalOrders = 0;
    let inProgressOrders = 0;
    let completedOrders = 0;
    let cancelledOrders = 0;
    let platformGrossRevenuePaise = 0;

    ordersAggregate.forEach((group) => {
      totalOrders += group.count;
      if (group._id === 'delivered') {
        completedOrders += group.count;
        platformGrossRevenuePaise += group.totalPaise;
      } else if (group._id === 'cancelled' || group._id === 'rejected') {
        cancelledOrders += group.count;
      } else {
        inProgressOrders += group.count;
      }
    });

    res.json({
      success: true,
      stats: {
        customers: {
          total: totalCustomers,
        },
        shops: {
          total: totalShops,
          pending: pendingShops,
          approved: approvedShops,
          rejected: rejectedShops,
          suspended: suspendedShops,
        },
        deliveryPartners: {
          total: totalPartners,
          pending: pendingPartners,
        },
        orders: {
          total: totalOrders,
          inProgress: inProgressOrders,
          completed: completedOrders,
          cancelled: cancelledOrders,
          totalRevenuePaise: platformGrossRevenuePaise,
          formattedRevenue: formatPaiseToINR(platformGrossRevenuePaise),
        },
        openComplaints,
      },
      recentOrders,
      recentShops,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all shops with filtering, search, pagination
// @route   GET /api/admin/shops
// @access  Private (Super Admin)
const getShops = async (req, res, next) => {
  try {
    const { status, category, search, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.approvalStatus = status;
    }
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [shops, total] = await Promise.all([
      Shop.find(filter)
        .populate('owner', 'name email phone avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Shop.countDocuments(filter),
    ]);

    res.json({
      success: true,
      shops,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a pending shop
// @route   PUT /api/admin/shops/:id/approve
// @access  Private (Super Admin)
const approveShop = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id).populate('owner');
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    shop.approvalStatus = 'approved';
    shop.rejectionReason = '';
    await shop.save();

    await recordAuditLog({
      adminId: req.user._id,
      action: 'APPROVE_SHOP',
      targetType: 'Shop',
      targetId: shop._id,
      targetName: shop.name,
      details: { previousStatus: shop.approvalStatus, ownerEmail: shop.owner?.email },
      req,
    });

    // Notify owner
    await Notification.create({
      recipient: shop.owner._id,
      title: 'Shop Approved! 🎉',
      message: `Congratulations! Your shop "${shop.name}" has been approved. You can now add products and manage deliveries.`,
      type: 'shop_approval',
    });

    res.json({
      success: true,
      message: `Shop "${shop.name}" has been approved successfully.`,
      shop,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject a shop registration
// @route   PUT /api/admin/shops/:id/reject
// @access  Private (Super Admin)
const rejectShop = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'A rejection reason is required.',
      });
    }

    const shop = await Shop.findById(req.params.id).populate('owner');
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    shop.approvalStatus = 'rejected';
    shop.rejectionReason = reason;
    await shop.save();

    await recordAuditLog({
      adminId: req.user._id,
      action: 'REJECT_SHOP',
      targetType: 'Shop',
      targetId: shop._id,
      targetName: shop.name,
      details: { reason },
      req,
    });

    // Notify owner
    await Notification.create({
      recipient: shop.owner._id,
      title: 'Shop Application Rejected',
      message: `Your registration for "${shop.name}" was not approved. Reason: ${reason}`,
      type: 'shop_approval',
    });

    res.json({
      success: true,
      message: `Shop "${shop.name}" has been rejected.`,
      shop,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Suspend or Reactivate a shop
// @route   PUT /api/admin/shops/:id/toggle-status
// @access  Private (Super Admin)
const toggleShopStatus = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id).populate('owner');
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    const newStatus = shop.approvalStatus === 'suspended' ? 'approved' : 'suspended';
    shop.approvalStatus = newStatus;
    await shop.save();

    await recordAuditLog({
      adminId: req.user._id,
      action: newStatus === 'suspended' ? 'SUSPEND_SHOP' : 'REACTIVATE_SHOP',
      targetType: 'Shop',
      targetId: shop._id,
      targetName: shop.name,
      details: { newStatus },
      req,
    });

    res.json({
      success: true,
      message: `Shop "${shop.name}" is now ${newStatus}.`,
      shop,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (customers, delivery partners)
// @route   GET /api/admin/users
// @access  Private (Super Admin)
const getUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 15 } = req.query;
    const filter = {};

    if (role && role !== 'all') {
      filter.role = role;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      users,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active/deactivated status
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private (Super Admin)
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot deactivate Super Admin.' });
    }

    user.isActive = !user.isActive;
    await user.save();

    await recordAuditLog({
      adminId: req.user._id,
      action: user.isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
      targetType: 'User',
      targetId: user._id,
      targetName: user.name,
      details: { email: user.email, role: user.role, isActive: user.isActive },
      req,
    });

    res.json({
      success: true,
      message: `User ${user.name} is now ${user.isActive ? 'Active' : 'Deactivated'}.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders across platform
// @route   GET /api/admin/orders
// @access  Private (Super Admin)
const getPlatformOrders = async (req, res, next) => {
  try {
    const { status, shopId, search, page = 1, limit = 15 } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }
    if (shopId) {
      filter.shop = shopId;
    }
    if (search) {
      filter.orderNumber = { $regex: search, $options: 'i' };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('customer', 'name email phone')
        .populate('shop', 'name category phone address')
        .populate('deliveryPartner', 'name phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      orders,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get audit logs
// @route   GET /api/admin/audit-logs
// @access  Private (Super Admin)
const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, targetType } = req.query;
    const filter = {};
    if (targetType && targetType !== 'all') {
      filter.targetType = targetType;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('admin', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      AuditLog.countDocuments(filter),
    ]);

    res.json({
      success: true,
      logs,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all complaints
// @route   GET /api/admin/complaints
// @access  Private (Super Admin)
const getComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find()
      .populate('customer', 'name email phone')
      .populate('shop', 'name')
      .populate('order', 'orderNumber totalPaise status')
      .sort({ createdAt: -1 });

    res.json({ success: true, complaints });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status
// @route   PUT /api/admin/complaints/:id
// @access  Private (Super Admin)
const updateComplaint = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (status) complaint.status = status;
    if (adminNotes !== undefined) complaint.adminNotes = adminNotes;
    if (status === 'resolved') {
      complaint.resolvedBy = req.user._id;
      complaint.resolvedAt = new Date();
    }

    await complaint.save();
    res.json({ success: true, message: 'Complaint updated', complaint });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getShops,
  approveShop,
  rejectShop,
  toggleShopStatus,
  getUsers,
  toggleUserStatus,
  getPlatformOrders,
  getAuditLogs,
  getComplaints,
  updateComplaint,
};

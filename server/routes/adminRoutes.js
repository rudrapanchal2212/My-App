const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(authenticate, authorize('admin'));

router.get('/dashboard-stats', getDashboardStats);
router.get('/shops', getShops);
router.put('/shops/:id/approve', approveShop);
router.put('/shops/:id/reject', rejectShop);
router.put('/shops/:id/toggle-status', toggleShopStatus);

router.get('/users', getUsers);
router.put('/users/:id/toggle-status', toggleUserStatus);

router.get('/orders', getPlatformOrders);
router.get('/audit-logs', getAuditLogs);
router.get('/complaints', getComplaints);
router.put('/complaints/:id', updateComplaint);

module.exports = router;

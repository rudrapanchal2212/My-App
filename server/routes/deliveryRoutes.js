const express = require('express');
const router = express.Router();
const {
  getMyDeliveries,
  markOrderPickedUp,
  markOrderDelivered,
} = require('../controllers/deliveryPartnerController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('delivery_partner', 'admin'));

router.get('/my-deliveries', getMyDeliveries);
router.put('/orders/:orderId/pickup', markOrderPickedUp);
router.put('/orders/:orderId/deliver', markOrderDelivered);

module.exports = router;

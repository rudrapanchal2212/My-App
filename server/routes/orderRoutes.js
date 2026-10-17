const express = require('express');
const router = express.Router();
const {
  createOrder,
  getCustomerOrders,
  getOrderDetails,
  cancelOrder,
  createReview,
  createComplaint,
} = require('../controllers/customerController');
const { authenticate } = require('../middleware/auth');
const { createOrderSchema, validateRequest } = require('../validators/schemas');

router.use(authenticate);

router.post('/', validateRequest(createOrderSchema), createOrder);
router.get('/my-orders', getCustomerOrders);
router.get('/:id', getOrderDetails);
router.put('/:id/cancel', cancelOrder);

// Reviews & Complaints linked to orders
router.post('/reviews', createReview);
router.post('/complaints', createComplaint);

module.exports = router;

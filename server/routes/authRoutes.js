const express = require('express');
const router = express.Router();
const {
  registerCustomer,
  registerShopOwner,
  login,
  getMe,
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const {
  registerCustomerSchema,
  registerShopOwnerSchema,
  loginSchema,
  validateRequest,
} = require('../validators/schemas');

router.post('/register-customer', validateRequest(registerCustomerSchema), registerCustomer);
router.post('/register-shop-owner', validateRequest(registerShopOwnerSchema), registerShopOwner);
router.post('/login', validateRequest(loginSchema), login);
router.get('/me', authenticate, getMe);

module.exports = router;

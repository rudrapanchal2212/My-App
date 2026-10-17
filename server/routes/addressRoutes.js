const express = require('express');
const router = express.Router();
const {
  getCustomerAddresses,
  addCustomerAddress,
  deleteCustomerAddress,
} = require('../controllers/customerController');
const { authenticate } = require('../middleware/auth');
const { createAddressSchema, validateRequest } = require('../validators/schemas');

router.use(authenticate);

router.get('/', getCustomerAddresses);
router.post('/', validateRequest(createAddressSchema), addCustomerAddress);
router.delete('/:id', deleteCustomerAddress);

module.exports = router;

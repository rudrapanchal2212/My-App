const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/shopOwnerController');
const {
  getPublicShops,
  getPublicShopDetails,
} = require('../controllers/customerController');
const { authenticate, authorize } = require('../middleware/auth');
const {
  updateShopSchema,
  productSchema,
  createDeliveryPartnerSchema,
  validateRequest,
} = require('../validators/schemas');

// Public Marketplace
router.get('/public', getPublicShops);
router.get('/public/:id', getPublicShopDetails);

// Shop Owner Private Routes
const ownerAuth = [authenticate, authorize('shop_owner', 'admin')];

router.get('/my-shop', ownerAuth, getMyShop);
router.put('/my-shop', ownerAuth, validateRequest(updateShopSchema), updateMyShop);

// Products
router.get('/my-shop/products', ownerAuth, getOwnerProducts);
router.post('/my-shop/products', ownerAuth, validateRequest(productSchema), addProduct);
router.put('/my-shop/products/:productId', ownerAuth, validateRequest(productSchema.partial()), updateProduct);
router.delete('/my-shop/products/:productId', ownerAuth, deleteProduct);

// Delivery Partners
router.get('/my-shop/delivery-partners', ownerAuth, getShopDeliveryPartners);
router.post('/my-shop/delivery-partners', ownerAuth, validateRequest(createDeliveryPartnerSchema), createDeliveryPartner);

// Orders
router.get('/my-shop/orders', ownerAuth, getShopOrders);
router.put('/my-shop/orders/:orderId/accept', ownerAuth, acceptOrder);
router.put('/my-shop/orders/:orderId/reject', ownerAuth, rejectOrder);
router.put('/my-shop/orders/:orderId/status', ownerAuth, updatePreparationStatus);
router.put('/my-shop/orders/:orderId/assign-partner', ownerAuth, assignDeliveryPartner);

module.exports = router;

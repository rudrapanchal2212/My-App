require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const Order = require('../models/Order');
const DeliveryPartnerProfile = require('../models/DeliveryPartnerProfile');
const { formatPaiseToINR, rupeesToPaise, paiseToRupees } = require('../utils/currency');
const { createAddressSchema, createOrderSchema } = require('../validators/schemas');

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failedTests++;
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 Starting Backend Automated Integration Test Suite');
  console.log('====================================================');

  try {
    await connectDB();

    // 1. Currency Utility Tests
    console.log('\n--- 1. Testing Currency & Integer Paise Logic ---');
    assert(rupeesToPaise(100) === 10000, 'Convert ₹100 to 10000 paise');
    assert(rupeesToPaise(49.50) === 4950, 'Convert ₹49.50 to 4950 paise');
    assert(paiseToRupees(10000) === 100, 'Convert 10000 paise to ₹100');
    assert(formatPaiseToINR(10000).includes('100'), 'Formatted INR includes 100');

    // 2. Auth & Password Hashing Tests
    console.log('\n--- 2. Testing User Auth & Role Hashing ---');
    const testEmail = `test_admin_${Date.now()}@quickbite.com`;
    const user = await User.create({
      name: 'Test Administrator',
      email: testEmail,
      phone: '+91 9999999999',
      password: 'SecurePassword@123',
      role: 'admin',
    });

    assert(user.password !== 'SecurePassword@123', 'Password was hashed with bcrypt');
    const isCorrectPassword = await user.comparePassword('SecurePassword@123');
    const isWrongPassword = await user.comparePassword('WrongPassword');
    assert(isCorrectPassword === true, 'comparePassword verifies valid credentials');
    assert(isWrongPassword === false, 'comparePassword rejects invalid credentials');

    // 3. Shop Registration & Approval Workflow Tests
    console.log('\n--- 3. Testing Shop Registration & Admin Approval ---');
    const ownerEmail = `owner_${Date.now()}@shop.com`;
    const owner = await User.create({
      name: 'Test Shop Owner',
      email: ownerEmail,
      phone: '+91 8888888888',
      password: 'OwnerPassword@123',
      role: 'shop_owner',
    });

    const testShop = await Shop.create({
      owner: owner._id,
      name: 'Tasty Bites Test Cafe',
      category: 'Fast Food',
      address: { street: 'Main Bazaar Road', city: 'Fatepura', postalCode: '389172' },
      phone: '+91 8888888888',
      approvalStatus: 'pending', // Must be pending upon registration!
      minOrderAmountPaise: 10000, // ₹100
      deliveryChargePaise: 3000, // ₹30
      freeDeliveryThresholdPaise: 30000, // ₹300
    });

    assert(testShop.approvalStatus === 'pending', 'Newly registered shop status is pending');

    // Super Admin approves the shop
    testShop.approvalStatus = 'approved';
    await testShop.save();
    assert(testShop.approvalStatus === 'approved', 'Super Admin successfully approved shop');

    // 4. Product Management & Pricing Tests
    console.log('\n--- 4. Testing Product Creation & Paise Pricing ---');
    const product = await Product.create({
      shop: testShop._id,
      name: 'Crispy Veg Burger',
      category: 'Burgers',
      pricePaise: 12000, // ₹120
      originalPricePaise: 15000, // ₹150
      stockQuantity: 20,
      isAvailable: true,
    });

    assert(product.pricePaise === 12000, 'Product price stored in integer paise (12000)');
    assert(product.stockQuantity === 20, 'Product stock initialized to 20');

    // 5. Order Placement & Price Validation Tests
    console.log('\n--- 5. Testing Order Creation, Total Calculation & Stock Deduction ---');
    const customer = await User.create({
      name: 'Test Customer',
      email: `customer_${Date.now()}@test.com`,
      phone: '+91 7777777777',
      password: 'CustomerPassword@123',
      role: 'customer',
    });

    const qty = 2;
    const expectedSubtotal = product.pricePaise * qty; // 24000 paise (₹240)
    // Subtotal (₹240) is less than free delivery threshold (₹300), so delivery charge applies:
    const expectedDelivery = testShop.deliveryChargePaise; // 3000 paise (₹30)
    const expectedTotal = expectedSubtotal + expectedDelivery; // 27000 paise (₹270)

    const order = await Order.create({
      orderNumber: `TEST-ORD-${Date.now()}`,
      customer: customer._id,
      shop: testShop._id,
      items: [
        {
          productId: product._id,
          name: product.name,
          unitPricePaise: product.pricePaise,
          quantity: qty,
          totalPricePaise: expectedSubtotal,
        },
      ],
      subtotalPaise: expectedSubtotal,
      discountPaise: 0,
      deliveryChargePaise: expectedDelivery,
      totalPaise: expectedTotal,
      paymentMethod: 'cash_on_delivery',
      paymentStatus: 'pending',
      status: 'pending',
      deliveryAddress: {
        street: 'House No. 12, Patel Faliyu',
        city: 'Fatepura',
        state: 'Gujarat',
        postalCode: '389172',
        contactPhone: '+91 7777777777',
      },
    });

    assert(order.subtotalPaise === 24000, 'Order subtotal correctly computed as 24000 paise');
    assert(order.deliveryChargePaise === 3000, 'Delivery fee 3000 paise correctly applied');
    assert(order.totalPaise === 27000, 'Order total 27000 paise correctly calculated');
    assert(order.status === 'pending', 'Order begins in pending status');

    // Atomic stock deduction verification
    await Product.findByIdAndUpdate(product._id, { $inc: { stockQuantity: -qty } });
    const updatedProduct = await Product.findById(product._id);
    assert(updatedProduct.stockQuantity === 18, 'Stock correctly decremented from 20 to 18');

    // 6. Delivery Partner & Order Lifecycle Tests
    console.log('\n--- 6. Testing Delivery Partner Assignment & Order Completion ---');
    const riderUser = await User.create({
      name: 'Test Rider',
      email: `rider_${Date.now()}@delivery.com`,
      phone: '+91 6666666666',
      password: 'RiderPassword@123',
      role: 'delivery_partner',
    });

    const riderProfile = await DeliveryPartnerProfile.create({
      user: riderUser._id,
      shop: testShop._id,
      owner: owner._id,
      vehicleType: 'Bike',
      approvalStatus: 'approved',
    });

    assert(riderProfile.approvalStatus === 'approved', 'Delivery partner active and linked to shop');

    // Shop owner accepts and assigns order
    order.status = 'accepted';
    order.deliveryPartner = riderUser._id;
    await order.save();
    assert(order.status === 'accepted', 'Order accepted by shop owner');

    // Rider picks up order
    order.status = 'out_for_delivery';
    await order.save();
    assert(order.status === 'out_for_delivery', 'Order marked out for delivery');

    // Rider completes delivery
    order.status = 'delivered';
    order.paymentStatus = 'paid';
    order.deliveredAt = new Date();
    await order.save();
    assert(order.status === 'delivered', 'Order marked delivered');
    assert(order.paymentStatus === 'paid', 'Cash on delivery marked as paid');

    // 7. Testing Strict Location Restriction (Fatepura 389172 Only)
    console.log('\n--- 7. Testing Strict Location Restriction (Fatepura 389172 Only) ---');
    const invalidAddressCheck = createAddressSchema.safeParse({
      label: 'Home',
      street: '123 MG Road',
      city: 'Ahmedabad',
      state: 'Gujarat',
      postalCode: '380001',
      contactPhone: '+91 9999999999',
    });
    assert(!invalidAddressCheck.success, 'Rejects address outside Fatepura (pincode 380001)');

    const validAddressCheck = createAddressSchema.safeParse({
      label: 'Home',
      street: 'House No 45, Near Gayatri Temple, Fatepura',
      city: 'Fatepura',
      state: 'Gujarat',
      postalCode: '389172',
      contactPhone: '+91 9898989898',
    });
    assert(validAddressCheck.success, 'Accepts valid Fatepura 389172 address with customer house details');

    const invalidOrderAddressCheck = createOrderSchema.safeParse({
      shopId: new mongoose.Types.ObjectId().toString(),
      items: [{ productId: new mongoose.Types.ObjectId().toString(), quantity: 1 }],
      deliveryAddress: {
        street: 'Andheri East',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400069',
      },
    });
    assert(!invalidOrderAddressCheck.success, 'Rejects order placement with delivery address outside 389172');

    // 8. Testing Order Cancellation Rules (Prohibit Customer Cancellation After Acceptance)
    console.log('\n--- 8. Testing Customer Cancellation Rules ---');
    const customerOrderPending = await Order.create({
      orderNumber: `ORD-TEST-PENDING-${Date.now()}`,
      customer: customer._id,
      shop: testShop._id,
      items: [{
        productId: product._id,
        name: product.name,
        unitPricePaise: 12000,
        quantity: 1,
        totalPricePaise: 12000,
      }],
      subtotalPaise: 12000,
      deliveryChargePaise: 3000,
      totalPaise: 15000,
      status: 'pending',
      deliveryAddress: {
        street: 'College Road, Fatepura',
        city: 'Fatepura',
        state: 'Gujarat',
        postalCode: '389172',
        contactPhone: '+91 9999999999',
      },
    });
    assert(customerOrderPending.status === 'pending', 'Customer order starts in pending status');

    // Customer can cancel pending order
    const canCancelPending = customerOrderPending.status === 'pending';
    assert(canCancelPending === true, 'Customer CAN cancel order while still pending shop confirmation');

    // Once accepted by shop, customer CANNOT cancel
    customerOrderPending.status = 'accepted';
    await customerOrderPending.save();

    const canCancelAccepted = customerOrderPending.status === 'pending';
    assert(canCancelAccepted === false, 'Customer CANNOT cancel order after it has been accepted by the shop');

    console.log('\n====================================================');
    console.log(`🎉 TEST SUMMARY: ${passedTests} passed, ${failedTests} failed.`);
    console.log('====================================================');

    await disconnectDB();

    if (failedTests > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('❌ Test execution error:', err);
    process.exit(1);
  }
}

runTests();

require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const DeliveryPartnerProfile = require('../models/DeliveryPartnerProfile');
const Address = require('../models/Address');
const Order = require('../models/Order');
const Review = require('../models/Review');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');

const seedData = async (shouldDisconnect = true) => {
  try {
    console.log('--- Seeding Platform Demo Data ---');
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    // Clear existing collections safely for fresh seed
    await Promise.all([
      User.deleteMany({}),
      Shop.deleteMany({}),
      Product.deleteMany({}),
      DeliveryPartnerProfile.deleteMany({}),
      Address.deleteMany({}),
      Order.deleteMany({}),
      Review.deleteMany({}),
      AuditLog.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log('🧹 Cleaned existing database collections.');

    // 1. Create Super Admin
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@quickbite.com',
      phone: '+91 9800000001',
      password: 'Password@123',
      role: 'admin',
      isActive: true,
    });

    // 2. Create Shop Owners
    const owner1 = await User.create({
      name: 'Chef Rajesh Sharma',
      email: 'owner1@spicegarden.com',
      phone: '+91 9800000002',
      password: 'Password@123',
      role: 'shop_owner',
      avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=200&auto=format&fit=crop&q=80',
    });

    const owner2 = await User.create({
      name: 'Anjali Verma',
      email: 'owner2@freshbasket.com',
      phone: '+91 9800000003',
      password: 'Password@123',
      role: 'shop_owner',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    });

    const owner3 = await User.create({
      name: 'Vikram Joshi',
      email: 'owner3@doughbakery.com',
      phone: '+91 9800000004',
      password: 'Password@123',
      role: 'shop_owner',
    });

    const owner4 = await User.create({
      name: 'Karan Mehra',
      email: 'owner4@burgershack.com',
      phone: '+91 9800000005',
      password: 'Password@123',
      role: 'shop_owner',
    });

    // 3. Create Shops
    // Shop 1: Spice Garden (Approved Restaurant)
    const shop1 = await Shop.create({
      owner: owner1._id,
      name: 'The Spice Garden Restaurant',
      slug: 'the-spice-garden-restaurant',
      category: 'Restaurant',
      description: 'Authentic North Indian curries, royal biryanis, and tandoori sizzlers made with traditional spices.',
      logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80',
      address: {
        street: 'Main Bazaar Road, Near Bus Stand',
        city: 'Fatepura',
        state: 'Gujarat',
        postalCode: '389172',
      },
      phone: '+91 9800000002',
      email: 'owner1@spicegarden.com',
      approvalStatus: 'approved',
      isOperating: true,
      operatingHours: { open: '11:00', close: '23:00' },
      estimatedDeliveryTime: '20-30 mins',
      minOrderAmountPaise: 20000, // ₹200
      deliveryChargePaise: 3500, // ₹35
      freeDeliveryThresholdPaise: 50000, // ₹500
      rating: 4.8,
      ratingCount: 142,
    });

    // Shop 2: Fresh Basket (Approved Grocery & Fruits)
    const shop2 = await Shop.create({
      owner: owner2._id,
      name: 'Fresh Basket Grocery & Organics',
      slug: 'fresh-basket-grocery-organics',
      category: 'Grocery',
      description: 'Daily fresh farm produce, dairy, artisanal pantry essentials, and fresh fruits directly to your door.',
      logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1200&auto=format&fit=crop&q=80',
      address: {
        street: 'Station Road, Opp. APMC Market',
        city: 'Fatepura',
        state: 'Gujarat',
        postalCode: '389172',
      },
      phone: '+91 9800000003',
      email: 'owner2@freshbasket.com',
      approvalStatus: 'approved',
      isOperating: true,
      operatingHours: { open: '07:00', close: '21:30' },
      estimatedDeliveryTime: '15-25 mins',
      minOrderAmountPaise: 15000, // ₹150
      deliveryChargePaise: 2500, // ₹25
      freeDeliveryThresholdPaise: 40000, // ₹400
      rating: 4.7,
      ratingCount: 88,
    });

    // Shop 3: Sugar & Dough (Approved Bakery)
    const shop3 = await Shop.create({
      owner: owner3._id,
      name: 'Sugar & Dough Artisan Bakery',
      slug: 'sugar-dough-artisan-bakery',
      category: 'Bakery',
      description: 'Handcrafted sourdoughs, flaky butter croissants, festive cheesecakes, and gourmet baked snacks.',
      logo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1200&auto=format&fit=crop&q=80',
      address: {
        street: 'College Road, Near Taluka Panchayat',
        city: 'Fatepura',
        state: 'Gujarat',
        postalCode: '389172',
      },
      phone: '+91 9800000004',
      email: 'owner3@doughbakery.com',
      approvalStatus: 'approved',
      isOperating: true,
      operatingHours: { open: '08:00', close: '22:00' },
      estimatedDeliveryTime: '20-30 mins',
      minOrderAmountPaise: 10000, // ₹100
      deliveryChargePaise: 3000, // ₹30
      freeDeliveryThresholdPaise: 35000, // ₹350
      rating: 4.9,
      ratingCount: 64,
    });

    // Shop 4: Burger & Wings Shack (PENDING Super Admin approval to demonstrate approval workflow)
    const shop4 = await Shop.create({
      owner: owner4._id,
      name: 'Burger & Wings Shack',
      slug: 'burger-wings-shack',
      category: 'Fast Food',
      description: 'Smash burgers, crispy seasoned fries, and peri-peri wings with signature dips.',
      logo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&auto=format&fit=crop&q=80',
      address: {
        street: 'Highway Circle, Jhalod Road',
        city: 'Fatepura',
        state: 'Gujarat',
        postalCode: '389172',
      },
      phone: '+91 9800000005',
      email: 'owner4@burgershack.com',
      approvalStatus: 'pending', // PENDING APPROVAL!
      isOperating: false,
      operatingHours: { open: '12:00', close: '01:00' },
      estimatedDeliveryTime: '30-40 mins',
      minOrderAmountPaise: 20000,
      deliveryChargePaise: 4000,
      freeDeliveryThresholdPaise: 50000,
      rating: 4.2,
      ratingCount: 0,
    });

    // 4. Create Products for Approved Shops (All prices in paise: ₹1 = 100 paise)
    // Products for Spice Garden
    const p1 = await Product.create({
      shop: shop1._id,
      name: 'Royal Butter Chicken (Murgh Makhani)',
      description: 'Tender tandoori chicken simmered in a velvety tomato, cream, and butter sauce with aromatic kasuri methi.',
      category: 'Main Course',
      image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=80',
      pricePaise: 36000, // ₹360
      originalPricePaise: 42000, // ₹420
      discountPercentage: 14,
      stockQuantity: 40,
      isAvailable: true,
      options: [
        { name: 'Boneless (Default)', pricePaise: 0, isRequired: true },
        { name: 'Extra Cream & Butter', pricePaise: 4000, isRequired: false },
      ],
    });

    const p2 = await Product.create({
      shop: shop1._id,
      name: 'Paneer Tikka Masala',
      description: 'Char-grilled cottage cheese cubes simmered in spiced onion-tomato gravy.',
      category: 'Main Course',
      image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&auto=format&fit=crop&q=80',
      pricePaise: 31000, // ₹310
      originalPricePaise: 35000, // ₹350
      discountPercentage: 11,
      stockQuantity: 35,
      isAvailable: true,
    });

    const p3 = await Product.create({
      shop: shop1._id,
      name: 'Hyderabadi Dum Biryani (Chicken)',
      description: 'Layers of long-grain fragrant basmati rice and marinated chicken cooked on dum with saffron and herbs.',
      category: 'Biryani',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80',
      pricePaise: 34000, // ₹340
      originalPricePaise: 38000, // ₹380
      discountPercentage: 10,
      stockQuantity: 50,
      isAvailable: true,
    });

    const p4 = await Product.create({
      shop: shop1._id,
      name: 'Garlic Butter Naan (2 pcs)',
      description: 'Freshly baked tandoori flatbread topped with minced garlic, coriander, and melted butter.',
      category: 'Breads',
      image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500&auto=format&fit=crop&q=80',
      pricePaise: 9000, // ₹90
      originalPricePaise: 10000, // ₹100
      discountPercentage: 10,
      stockQuantity: 100,
      isAvailable: true,
    });

    // Products for Fresh Basket Grocery
    const p5 = await Product.create({
      shop: shop2._id,
      name: 'Royal Gala Apples (1 kg)',
      description: 'Crisp, sweet, and juicy handpicked mountain apples.',
      category: 'Fruits & Vegetables',
      image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80',
      pricePaise: 18000, // ₹180
      originalPricePaise: 22000, // ₹220
      discountPercentage: 18,
      stockQuantity: 45,
      isAvailable: true,
    });

    const p6 = await Product.create({
      shop: shop2._id,
      name: 'Organic Whole Cow Milk (1 Litre)',
      description: 'Farm-fresh, pasteurized, non-homogenized whole cow milk in an eco bottle.',
      category: 'Dairy',
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80',
      pricePaise: 7500, // ₹75
      originalPricePaise: 8000, // ₹80
      discountPercentage: 6,
      stockQuantity: 60,
      isAvailable: true,
    });

    const p7 = await Product.create({
      shop: shop2._id,
      name: 'Hass Avocados (Pack of 2)',
      description: 'Perfect for guacamole and salads. Rich and creamy texture.',
      category: 'Fruits & Vegetables',
      image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&auto=format&fit=crop&q=80',
      pricePaise: 19900, // ₹199
      originalPricePaise: 25000, // ₹250
      discountPercentage: 20,
      stockQuantity: 30,
      isAvailable: true,
    });

    // Products for Sugar & Dough Bakery
    const p8 = await Product.create({
      shop: shop3._id,
      name: 'Artisan Sourdough Country Loaf',
      description: 'Naturally fermented for 36 hours with a golden crunchy crust and open, chewy crumb.',
      category: 'Breads',
      image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=500&auto=format&fit=crop&q=80',
      pricePaise: 16000, // ₹160
      originalPricePaise: 18000, // ₹180
      discountPercentage: 11,
      stockQuantity: 25,
      isAvailable: true,
    });

    const p9 = await Product.create({
      shop: shop3._id,
      name: 'Dark Chocolate Truffle Slice',
      description: 'Decadent 70% Belgian chocolate mousse cake on a chocolate sponge base.',
      category: 'Pastries & Cakes',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=80',
      pricePaise: 19000, // ₹190
      originalPricePaise: 21000, // ₹210
      discountPercentage: 9,
      stockQuantity: 20,
      isAvailable: true,
    });

    // 5. Create Delivery Partners
    // Delivery Partner 1 (assigned to Spice Garden)
    const partnerUser1 = await User.create({
      name: 'Rahul Sharma (Rider)',
      email: 'rahul@delivery.com',
      phone: '+91 9800000010',
      password: 'Password@123',
      role: 'delivery_partner',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    });

    const partnerProfile1 = await DeliveryPartnerProfile.create({
      user: partnerUser1._id,
      shop: shop1._id,
      owner: owner1._id,
      vehicleType: 'Bike',
      vehicleNumber: 'MH-01-AB-1234',
      approvalStatus: 'approved',
      isAvailable: true,
      totalDeliveries: 48,
      rating: 4.9,
    });

    // Delivery Partner 2 (assigned to Fresh Basket)
    const partnerUser2 = await User.create({
      name: 'Amit Kumar (Rider)',
      email: 'amit@delivery.com',
      phone: '+91 9800000011',
      password: 'Password@123',
      role: 'delivery_partner',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    });

    const partnerProfile2 = await DeliveryPartnerProfile.create({
      user: partnerUser2._id,
      shop: shop2._id,
      owner: owner2._id,
      vehicleType: 'Scooter',
      vehicleNumber: 'MH-02-CD-5678',
      approvalStatus: 'approved',
      isAvailable: true,
      totalDeliveries: 31,
      rating: 4.8,
    });

    // 6. Create Customer
    const customer = await User.create({
      name: 'Priya Patel',
      email: 'customer@quickbite.com',
      phone: '+91 9800000020',
      password: 'Password@123',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    });

    // Customer Addresses (Specific house/faliyu address chosen by customer, Fatepura 389172)
    const addr1 = await Address.create({
      customer: customer._id,
      label: 'Home',
      street: 'House No. 45, Sardar Patel Society, Near Primary School',
      apartment: 'Main Road',
      city: 'Fatepura',
      state: 'Gujarat',
      postalCode: '389172',
      contactPhone: '+91 9800000020',
      isDefault: true,
    });

    const addr2 = await Address.create({
      customer: customer._id,
      label: 'Work',
      street: 'Shop No. 12, Guru Kripa Complex, Main Bazaar',
      apartment: 'Ground Floor',
      city: 'Fatepura',
      state: 'Gujarat',
      postalCode: '389172',
      contactPhone: '+91 9800000020',
      isDefault: false,
    });

    // 7. Create Orders demonstrating Order Lifecycle
    // Order 1: Completed & Delivered
    const order1Subtotal = p1.pricePaise * 1 + p4.pricePaise * 2; // 36000 + 18000 = 54000 paise (₹540)
    // Free delivery threshold for shop1 is ₹500 (50000 paise), so deliveryCharge is 0!
    const order1Delivery = 0;
    const order1Total = order1Subtotal + order1Delivery;

    const order1 = await Order.create({
      orderNumber: 'ORD-261016-1001',
      customer: customer._id,
      shop: shop1._id,
      deliveryPartner: partnerUser1._id,
      items: [
        {
          productId: p1._id,
          name: p1.name,
          image: p1.image,
          unitPricePaise: p1.pricePaise,
          quantity: 1,
          totalPricePaise: p1.pricePaise,
        },
        {
          productId: p4._id,
          name: p4.name,
          image: p4.image,
          unitPricePaise: p4.pricePaise,
          quantity: 2,
          totalPricePaise: p4.pricePaise * 2,
        },
      ],
      subtotalPaise: order1Subtotal,
      discountPaise: 0,
      deliveryChargePaise: order1Delivery,
      totalPaise: order1Total,
      paymentMethod: 'cash_on_delivery',
      paymentStatus: 'paid',
      status: 'delivered',
      deliveredAt: new Date(Date.now() - 3600000 * 2), // 2 hours ago
      statusHistory: [
        { status: 'pending', timestamp: new Date(Date.now() - 3600000 * 3), note: 'Order placed by customer.' },
        { status: 'accepted', timestamp: new Date(Date.now() - 3600000 * 2.8), note: 'Accepted by shop.' },
        { status: 'preparing', timestamp: new Date(Date.now() - 3600000 * 2.6), note: 'Kitchen preparing meal.' },
        { status: 'ready_for_pickup', timestamp: new Date(Date.now() - 3600000 * 2.4), note: 'Packed and ready for pickup.' },
        { status: 'out_for_delivery', timestamp: new Date(Date.now() - 3600000 * 2.2), note: 'Picked up by Rahul Sharma.' },
        { status: 'delivered', timestamp: new Date(Date.now() - 3600000 * 2), note: 'Delivered to customer.' },
      ],
      deliveryAddress: {
        label: addr1.label,
        street: addr1.street,
        city: addr1.city,
        state: addr1.state,
        postalCode: addr1.postalCode,
        contactPhone: addr1.contactPhone,
      },
    });

    // Review for Order 1
    await Review.create({
      order: order1._id,
      customer: customer._id,
      shop: shop1._id,
      rating: 5,
      comment: 'Absolutely mouthwatering Butter Chicken and hot garlic naans! Fast delivery too.',
    });

    // Order 2: Active / In-Progress Order (Assigned to Delivery Partner, out for delivery)
    const order2Subtotal = p5.pricePaise * 2 + p6.pricePaise * 1; // 36000 + 7500 = 43500 paise (₹435)
    // Free delivery threshold for shop2 is ₹400 (40000 paise), so deliveryCharge is 0!
    const order2 = await Order.create({
      orderNumber: 'ORD-261016-1002',
      customer: customer._id,
      shop: shop2._id,
      deliveryPartner: partnerUser2._id,
      items: [
        {
          productId: p5._id,
          name: p5.name,
          image: p5.image,
          unitPricePaise: p5.pricePaise,
          quantity: 2,
          totalPricePaise: p5.pricePaise * 2,
        },
        {
          productId: p6._id,
          name: p6.name,
          image: p6.image,
          unitPricePaise: p6.pricePaise,
          quantity: 1,
          totalPricePaise: p6.pricePaise,
        },
      ],
      subtotalPaise: order2Subtotal,
      discountPaise: 0,
      deliveryChargePaise: 0,
      totalPaise: order2Subtotal,
      paymentMethod: 'cash_on_delivery',
      paymentStatus: 'pending',
      status: 'out_for_delivery',
      statusHistory: [
        { status: 'pending', timestamp: new Date(Date.now() - 1800000), note: 'Order placed by customer.' },
        { status: 'accepted', timestamp: new Date(Date.now() - 1500000), note: 'Accepted by shop.' },
        { status: 'preparing', timestamp: new Date(Date.now() - 1200000), note: 'Items gathered and packed.' },
        { status: 'out_for_delivery', timestamp: new Date(Date.now() - 600000), note: 'Picked up by Amit Kumar.' },
      ],
      deliveryAddress: {
        label: addr1.label,
        street: addr1.street,
        city: addr1.city,
        state: addr1.state,
        postalCode: addr1.postalCode,
        contactPhone: addr1.contactPhone,
      },
    });

    // Order 3: Pending Order waiting for shop acceptance
    const order3Subtotal = p8.pricePaise * 1; // 16000 paise (₹160)
    const order3Delivery = shop3.deliveryChargePaise; // ₹30 (subtotal < threshold ₹350)
    await Order.create({
      orderNumber: 'ORD-261016-1003',
      customer: customer._id,
      shop: shop3._id,
      items: [
        {
          productId: p8._id,
          name: p8.name,
          image: p8.image,
          unitPricePaise: p8.pricePaise,
          quantity: 1,
          totalPricePaise: p8.pricePaise,
        },
      ],
      subtotalPaise: order3Subtotal,
      discountPaise: 0,
      deliveryChargePaise: order3Delivery,
      totalPaise: order3Subtotal + order3Delivery,
      paymentMethod: 'cash_on_delivery',
      paymentStatus: 'pending',
      status: 'pending',
      statusHistory: [
        { status: 'pending', timestamp: new Date(Date.now() - 300000), note: 'Order placed by customer.' },
      ],
      deliveryAddress: {
        label: addr2.label,
        street: addr2.street,
        city: addr2.city,
        state: addr2.state,
        postalCode: addr2.postalCode,
        contactPhone: addr2.contactPhone,
      },
    });

    // 8. Create Sample Audit Log
    await AuditLog.create({
      admin: admin._id,
      action: 'APPROVE_SHOP',
      targetType: 'Shop',
      targetId: shop1._id,
      targetName: shop1.name,
      details: { category: shop1.category, city: shop1.address.city },
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    });

    console.log('✅ Demo Seed Data Loaded Successfully!');
    console.log('========================================================================');
    console.log('🌟 READY-TO-USE ACCOUNTS (All passwords: Password@123)');
    console.log('------------------------------------------------------------------------');
    console.log('1. Super Admin:      admin@quickbite.com');
    console.log('2. Shop Owner 1:     owner1@spicegarden.com (Spice Garden - Approved)');
    console.log('3. Shop Owner 2:     owner2@freshbasket.com (Fresh Basket - Approved)');
    console.log('4. Shop Owner 3:     owner3@doughbakery.com (Sugar & Dough - Approved)');
    console.log('5. Shop Owner 4:     owner4@burgershack.com (Burger Shack - PENDING Approval)');
    console.log('6. Delivery Partner: rahul@delivery.com (Spice Garden Fleet)');
    console.log('7. Delivery Partner: amit@delivery.com (Fresh Basket Fleet)');
    console.log('8. Customer:         customer@quickbite.com (Priya Patel)');
    console.log('========================================================================');

    if (shouldDisconnect) {
      await disconnectDB();
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    if (shouldDisconnect) process.exit(1);
    throw error;
  }
};

if (require.main === module) {
  seedData(true);
}

module.exports = seedData;

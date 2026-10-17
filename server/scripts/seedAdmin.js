require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    console.log('--- Initializing Super Admin Setup Script ---');
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@quickbite.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const adminName = process.env.ADMIN_NAME || 'Platform Super Admin';
    const adminPhone = process.env.ADMIN_PHONE || '+91 9876543210';

    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      console.log(`ℹ️ Admin user already exists with email: ${adminEmail}`);
      admin.role = 'admin';
      admin.isActive = true;
      admin.password = adminPassword; // Will be hashed by pre-save hook
      await admin.save();
      console.log('✅ Admin password & privileges refreshed successfully.');
    } else {
      admin = await User.create({
        name: adminName,
        email: adminEmail,
        phone: adminPhone,
        password: adminPassword,
        role: 'admin',
        isActive: true,
      });
      console.log(`✅ Super Admin created successfully!`);
    }

    console.log('==================================================');
    console.log('👑 Super Admin Credentials:');
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('==================================================');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to seed Super Admin:', error);
    process.exit(1);
  }
};

seedAdmin();

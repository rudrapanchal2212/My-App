require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect Database and launch server
const startServer = async () => {
  try {
    await connectDB();

    // Check if database is empty and automatically populate demo data
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Database is empty. Seeding initial platform demo data...');
      const seedData = require('./scripts/seedData');
      await seedData(false);
    }

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 QuickBite Delivery Server is running on port: ${PORT}`);
      console.log(`🌐 Local API Base URL: http://localhost:${PORT}/api`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
};

startServer();

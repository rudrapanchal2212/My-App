const mongoose = require('mongoose');

let memoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  try {
    if (uri && !uri.includes('your_mongodb_atlas_connection_string')) {
      console.log('Connecting to MongoDB Atlas / configured URI...');
      await mongoose.connect(uri);
      console.log('✅ MongoDB connected successfully to:', mongoose.connection.host);
      return;
    }

    console.log('ℹ️ No active MONGODB_URI found in .env (or placeholder present).');
    console.log('Starting in-memory MongoDB instance for local development and testing...');
    
    // Dynamic import/require mongodb-memory-server
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    const memoryUri = memoryServer.getUri();

    await mongoose.connect(memoryUri);
    console.log('✅ In-memory MongoDB started and connected successfully!');
    console.log('💡 To use MongoDB Atlas, configure MONGODB_URI in server/.env');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
    }
  } catch (error) {
    console.error('Error disconnecting MongoDB:', error);
  }
};

module.exports = { connectDB, disconnectDB };

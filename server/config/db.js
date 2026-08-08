const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.log('TIP: Install MongoDB locally or update MONGODB_URI in server/.env');
    console.log('Server will start without database - API routes will return errors until DB is connected.');
    return false;
  }
};

module.exports = connectDB;

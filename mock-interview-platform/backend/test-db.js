const mongoose = require('mongoose');
require('dotenv').config();

console.log('Testing MongoDB Connection...\n');
console.log('Connection string:', process.env.MONGODB_URI, '\n');

const testConnection = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    });
    console.log('✅ MongoDB Connected Successfully!');
    console.log(`Host: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    await mongoose.connection.close();
    console.log('\nConnection test completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection Failed:');
    console.error(`Error: ${error.message}`);
    if (error.message.includes('authentication failed')) {
      console.log('\n📝 Check your MongoDB Atlas credentials and ensure IP whitelist includes 0.0.0.0');
    }
    process.exit(1);
  }
};

testConnection();

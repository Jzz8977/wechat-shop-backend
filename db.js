const mongoose = require('mongoose');
const config = require('./config');
const Address = require('./models/Address');
const Cart = require('./models/Cart');
const Category = require('./models/Category');

const Coupon = require('./models/Coupon');
const Inventory = require('./models/Inventory');
const Order = require('./models/Order');
const OrderDetail = require('./models/OrderDetail');
const Product = require('./models/Product');
const User = require('./models/User');

// 连接数据库
const connectDB = async () => {
  try {
    await mongoose.connect(config.db.uri, config.db.options);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = { connectDB };
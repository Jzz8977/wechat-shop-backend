const mongoose = require('mongoose');
const config = require('../config');
const Address = require('../models/address');
const Cart = require('../models/cart');
const Category = require('../models/category');

const Coupon = require('../models/coupon');
const Inventory = require('../models/inventory');
const Order = require('../models/order');
const OrderDetail = require('../models/orderDetail');
const Product = require('../models/product');
const User = require('../models/user');

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
const express = require('express');
const cart = require('../models/cart');

const router = express.Router();

// 获取所有订单详情
router.get('/', async (req, res) => {
  try {
    const carts = await cart.find();
    res.json(carts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 创建新订单详情
router.post('/', async (req, res) => {
  const cart = new cart(req.body);
  try {
    const newcart = await cart.save();
    res.status(201).json(newcart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
const express = require('express');
const address = require('../models/address');

const router = express.Router();

// 获取所有订单详情
router.get('/', async (req, res) => {
  try {
    const address = await address.find();
    res.json(address);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 创建新订单详情
router.post('/', async (req, res) => {
  const address = new address(req.body);
  try {
    const newaddress = await address.save();
    res.status(201).json(newaddress);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
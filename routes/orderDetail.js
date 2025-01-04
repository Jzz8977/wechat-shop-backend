const express = require('express');
const OrderDetail = require('../models/orderDetail');

const router = express.Router();

// 获取所有订单详情
router.get('/', async (req, res) => {
  try {
    const orderDetails = await OrderDetail.find();
    res.json(orderDetails);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 创建新订单详情
router.post('/', async (req, res) => {
  const orderDetail = new OrderDetail(req.body);
  try {
    const newOrderDetail = await orderDetail.save();
    res.status(201).json(newOrderDetail);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
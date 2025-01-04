const express = require('express');
const Category = require('../models/category');

const router = express.Router();

// 获取所有订单详情
router.get('/', async (req, res) => {
  try {
    const categorys = await Category.find();
    res.json(categorys);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 创建新订单详情
router.post('/', async (req, res) => {
  const category = new Category(req.body);
  try {
    const newCategory = await category.save();
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
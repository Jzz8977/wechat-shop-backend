const express = require('express');
const Inventory = require('../models/inventory');

const router = express.Router();

// 获取所有库存
router.get('/', async (req, res) => {
  try {
    const inventories = await Inventory.find();
    res.json(inventories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 创建新库存
router.post('/', async (req, res) => {
  const inventory = new Inventory(req.body);
  try {
    const newInventory = await inventory.save();
    res.status(201).json(newInventory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
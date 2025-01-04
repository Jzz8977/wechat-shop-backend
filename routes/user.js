const express = require('express');
const User = require('../models/user');

const router = express.Router();

// 获取所有用户
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.success(users);
  } catch (err) {
    res.error(err.message);
  }
});

// 创建新用户
router.post('/', async (req, res) => {
  const user = new User(req.body);
  try {
    const newUser = await user.save();
    res.success(newUser);
  } catch (err) {
    res.error(err.message, 400);
  }
});

module.exports = router;
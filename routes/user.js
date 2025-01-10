const express = require('express');
const jwt = require('jsonwebtoken');
const dbService = require('../services/dbService');
const axios = require('axios');
const User = require('../models/user');
const config = require('../config');
const responseHandler = require('../middlewares/responseHandler');
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

// 微信小程序登录
router.post('/login', async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.error('Code is required', 400);
  }

  try {
    const response = await axios.get(`https://api.weixin.qq.com/sns/jscode2session`, {
      params: {
        appid: config.WECHAT_APPID,
        secret: config.WECHAT_SECRET,
        js_code: code,
        grant_type: 'authorization_code'
      }
    });

    const { openid, session_key } = response.data;
    if (!openid) {
      return res.error('Failed to get OpenID', 400);
    }

    let user = await User.findOne({ openid });
    if (!user) {
      user = new User({ openid });
      await user.save();
    }

    const token = jwt.sign({ userId: user._id }, config.JWT_SECRET, { expiresIn: '7d' });
    res.success({ token, openid, session_key });

  } catch (err) {
    res.error(err.message);
  }
});

router.post('/info', async (req, res) => {
  const { openid, nickName, avatarUrl } = req.body;
  
  if (!openid) {
    return res.error('OpenID is required', 400);
  }

  try {
    // Find the user by openid
    let user = await User.findOne({ openid });

    if (user) {
      // Update existing user
      user.nickName = nickName || user.nickName;
      user.avatarUrl = avatarUrl || user.avatarUrl;
    } 
    // Save the user
    await user.save();
    res.success(user, 'User information updated successfully');
  } catch (err) {
    res.error(err.message);
  }
});

module.exports = router;
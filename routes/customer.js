const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const Customer = require('../models/customer');
const config = require('../config');
const responseHandler = require('../middlewares/responseHandler');
const { verifyToken, isAdmin, hasPermission } = require('../middlewares/authMiddleware');
const router = express.Router();

// 获取所有客户
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find();
    res.success(customers);
  } catch (err) {
    res.error(err.message);
  }
});

// 创建新客户
router.post('/', async (req, res) => {
  const customer = new Customer(req.body);
  try {
    const newCustomer = await customer.save();
    res.success(newCustomer);
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

    let customer = await Customer.findOne({ openid });
    if (!customer) {
      customer = new Customer({ openid });
      await customer.save();
    }

    const token = jwt.sign({ customerId: customer._id }, config.JWT_SECRET, { expiresIn: '7d' });
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
    let customer = await Customer.findOne({ openid });

    if (customer) {
      customer.nickName = nickName || customer.nickName;
      customer.avatarUrl = avatarUrl || customer.avatarUrl;
    } 
    await customer.save();
    res.success(customer, 'Customer information updated successfully');
  } catch (err) {
    res.error(err.message);
  }
});

module.exports = router; 
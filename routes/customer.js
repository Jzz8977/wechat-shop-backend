const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const Customer = require('../models/customer');
const config = require('../config');
const responseHandler = require('../middlewares/responseHandler');
const { verifyToken, isAdmin, hasPermission } = require('../middlewares/authMiddleware');
const router = express.Router();

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

// 获取客户列表
router.post('/list', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10,
      keyword,
      sort = 'createdAt',
      order = 'desc'
    } = req.body;
    
    // 构建查询条件
    const query = {};
    if (keyword) {
      query.$or = [
        { nickname: new RegExp(keyword, 'i') },
        { openid: new RegExp(keyword, 'i') },
        { phone: new RegExp(keyword, 'i') }
      ];
    }
    
    // 计算总数
    const total = await Customer.countDocuments(query);
    
    // 获取客户列表
    const customers = await Customer.find(query)
      .select('-__v')
      .sort({ [sort]: order })
      .skip((page - 1) * limit)
      .limit(limit);
    
    res.success({
      total,
      page: Number(page),
      limit: Number(limit),
      items: customers
    });
  } catch (err) {
    res.error(err.message);
  }
});

module.exports = router; 
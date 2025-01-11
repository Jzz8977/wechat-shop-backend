const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const config = require('../config');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

// 用户登录
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.error('User not found', 404);
    }
    
    // 使用bcrypt验证密码
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.error('Invalid password', 401);
    }
    
    if (user.status !== 'active') {
      return res.error('User account is not active', 403);
    }
    
    const token = jwt.sign(
      { 
        userId: user._id,
        role: user.role,
        permissions: user.permissions 
      }, 
      config.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    res.success({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        permissions: user.permissions,
        status: user.status
      }
    });
  } catch (err) {
    res.error(err.message);
  }
});

// 创建/更新用户
router.post('/create', async (req, res) => {
  let { id, username, password, role, permissions } = req.body;
  console.log(req.body);
  
  try {
    // 如果没有提供id，则生成一个唯一id
    if (!id) {
      // 使用时间戳 + 随机数生成唯一ID
      id = `USER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // 检查用户ID是否已存在
    let user = await User.findOne({ id });
    
    if (user) {
      // 更新已存在的用户
      user.username = username || user.username;
      if (password) {
        user.password = password; // 密码会通过中间件自动加密
      }
      user.role = role || user.role;
      user.permissions = permissions || user.permissions;
    } else {
      // 创建新用户
      user = new User({
        id,
        username,
        password, // 密码会通过中间件自动加密
        role,
        permissions,
        status: 'active'
      });
    }
    
    await user.save();
    // 不返回密码字段
    const userResponse = user.toObject();
    delete userResponse.password;
    res.success(userResponse, 'User created/updated successfully');
  } catch (err) {
    res.error(err.message, 400);
  }
});

// 更新用户信息
router.post('/update', verifyToken, async (req, res) => {
  const { _id, username, password, role, permissions, status } = req.body;
  console.log(_id)
  try {
    const user = await User.findById(_id);
    
    if (!user) {
      return res.error('User not found', 404);
    }
    
    // 只有管理员可以修改角色和权限
    if ((role || permissions) && req.user.role !== 'admin') {
      return res.error('Permission denied', 403);
    }
    
    // 更新用户信息
    if (username) user.username = username;
    if (password) user.password = password; // 密码会通过中间件自动加密
    if (role && req.user.role === 'admin') user.role = role;
    if (permissions && req.user.role === 'admin') user.permissions = permissions;
    if (status && req.user.role === 'admin') user.status = status;
    
    await user.save();
    // 不返回密码字段
    const userResponse = user.toObject();
    delete userResponse.password;
    res.success(userResponse, 'User updated successfully');
  } catch (err) {
    res.error(err.message);
  }
});

// 获取用户信息
router.post('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.error('User not found', 404);
    }
    res.success(user);
  } catch (err) {
    res.error(err.message);
  }
});

// 获取所有用户
router.post('/list', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.success(users);
  } catch (err) {
    res.error(err.message);
  }
});

// 删除用户
router.post('/delete', verifyToken, isAdmin, async (req, res) => {
  const { userId } = req.body;
  
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return res.error('User not found', 404);
    }
    
    if (user.role === 'admin') {
      return res.error('Cannot delete admin user', 403);
    }
    
    await User.findByIdAndDelete(userId);
    res.success(null, 'User deleted successfully');
  } catch (err) {
    res.error(err.message);
  }
});

// 获取用户列表
router.post('/list', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.success(users);
  } catch (err) {
    res.error(err.message);
  }
});

module.exports = router;
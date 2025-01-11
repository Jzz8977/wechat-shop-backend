const jwt = require('jsonwebtoken');
const User = require('../models/user');
const config = require('../config');

// 验证 JWT token
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.error('No token provided', 401);
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user || user.status !== 'active') {
      return res.error('User not found or inactive', 401);
    }
    
    req.user = user;
    next();
  } catch (err) {
    res.error('Invalid token', 401);
  }
};

// 检查是否是管理员
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.error('Admin access required', 403);
  }
  next();
};

// 检查权限
const hasPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user.permissions.includes(permission)) {
      return res.error('Permission denied', 403);
    }
    next();
  };
};

module.exports = {
  verifyToken,
  isAdmin,
  hasPermission
}; 
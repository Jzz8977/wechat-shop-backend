const User = require('../models/User');
const Order = require('../models/Order');
const Category = require('../models/Category'); // 新增

const dbService = {
  // 通用创建方法
  create: async (Model, data) => {
    const document = new Model(data);
    return await document.save();
  },

  // 通用获取方法
  getById: async (Model, id) => {
    return await Model.findById(id);
  },

  // 通用更新方法
  updateById: async (Model, id, updateData) => {
    return await Model.findByIdAndUpdate(id, updateData, { new: true });
  },

  // 通用删除方法
  deleteById: async (Model, id) => {
    return await Model.findByIdAndDelete(id);
  },

  // ...existing code...
};

module.exports = dbService;

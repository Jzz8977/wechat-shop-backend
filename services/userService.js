const User = require('../models/user');
const dbService = require('./dbService');

const userService = {
  createUser: async (userData) => {
    return await dbService.create(User, userData);
  },

  getUserById: async (userId) => {
    return await dbService.getById(User, userId);
  },

  updateUser: async (userId, updateData) => {
    return await dbService.updateById(User, userId, updateData);
  },

  deleteUser: async (userId) => {
    return await dbService.deleteById(User, userId);
  }
};

module.exports = userService;

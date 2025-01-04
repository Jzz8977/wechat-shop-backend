const Order = require('../models/Order');
const dbService = require('./dbService');

const orderService = {
  createOrder: async (orderData) => {
    return await dbService.create(Order, orderData);
  },

  getOrderById: async (orderId) => {
    return await dbService.getById(Order, orderId);
  },

  updateOrder: async (orderId, updateData) => {
    return await dbService.updateById(Order, orderId, updateData);
  },

  deleteOrder: async (orderId) => {
    return await dbService.deleteById(Order, orderId);
  }
};

module.exports = orderService;

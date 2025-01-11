const Customer = require('../models/customer');
const dbService = require('./dbService');

const customerService = {
  createCustomer: async (customerData) => {
    return await dbService.create(Customer, customerData);
  },

  getCustomerById: async (customerId) => {
    return await dbService.getById(Customer, customerId);
  },

  updateCustomer: async (customerId, updateData) => {
    return await dbService.updateById(Customer, customerId, updateData);
  },

  deleteCustomer: async (customerId) => {
    return await dbService.deleteById(Customer, customerId);
  }
};

module.exports = customerService; 
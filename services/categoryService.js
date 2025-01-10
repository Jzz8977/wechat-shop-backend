const Category = require('../models/category');
const dbService = require('./dbService');

const categoryService = {
  createCategory: async (categoryData) => {
    return await dbService.create(Category, categoryData);
  },

  getCategoryById: async (categoryId) => {
    return await dbService.getById(Category, categoryId);
  },

  updateCategory: async (categoryId, updateData) => {
    return await dbService.updateById(Category, categoryId, updateData);
  },

  deleteCategory: async (categoryId) => {
    return await dbService.deleteById(Category, categoryId);
  }
};

module.exports = categoryService;

const express = require('express');
const Category = require('../models/category');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

// 获取分类列表
router.post('/list', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10,
      parentId = null,
      keyword,
      status = 'active'
    } = req.body;

    // 构建查询条件
    const query = { status };
    if (parentId) {
      query.parentId = parentId;
    } else {
      query.parentId = null; // 默认查询一级分类
    }
    if (keyword) {
      query.name = new RegExp(keyword, 'i');
    }

    // 计算总数
    const total = await Category.countDocuments(query);

    // 获取分类列表
    const categories = await Category.find(query)
      .sort({ order: -1, createdAt: -1 }) // 按排序权重和创建时间排序
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('parentId', 'name'); // 关联父分类信息

    // 如果是查询一级分类，同时获取其子分类
    if (!parentId) {
      const categoriesWithChildren = await Promise.all(
        categories.map(async (category) => {
          const children = await Category.find({
            parentId: category._id,
            status: 'active'
          }).sort({ order: -1 });
          return {
            ...category.toObject(),
            children
          };
        })
      );

      return res.success({
        total,
        page: Number(page),
        limit: Number(limit),
        items: categoriesWithChildren
      });
    }

    res.success({
      total,
      page: Number(page),
      limit: Number(limit),
      items: categories
    });
  } catch (err) {
    res.error(err.message);
  }
});

// 创建分类
router.post('/create', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, description, parentId, order, icon } = req.body;

    // 检查分类名称是否已存在
    const existingCategory = await Category.findOne({ 
      name,
      parentId: parentId || null
    });
    
    if (existingCategory) {
      return res.error('Category name already exists', 400);
    }

    // 确定分类层级
    let level = 1;
    if (parentId) {
      const parentCategory = await Category.findById(parentId);
      if (!parentCategory) {
        return res.error('Parent category not found', 404);
      }
      level = parentCategory.level + 1;
      if (level > 2) {
        return res.error('Maximum category level exceeded', 400);
      }
    }

    const category = new Category({
      name,
      description,
      parentId: parentId || null,
      level,
      order: order || 0,
      icon
    });

    await category.save();
    res.success(category, 'Category created successfully');
  } catch (err) {
    res.error(err.message);
  }
});

// 更新分类
router.post('/update', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id, name, description, order, icon, status } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.error('Category not found', 404);
    }

    // 检查分类名称是否与其他分类重复
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({
        name,
        parentId: category.parentId,
        _id: { $ne: id }
      });
      
      if (existingCategory) {
        return res.error('Category name already exists', 400);
      }
    }

    // 更新分类信息
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (order !== undefined) category.order = order;
    if (icon !== undefined) category.icon = icon;
    if (status) category.status = status;

    await category.save();
    res.success(category, 'Category updated successfully');
  } catch (err) {
    res.error(err.message);
  }
});

// 删除分类
router.post('/delete', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.body;

    // 检查是否存在子分类
    const hasChildren = await Category.exists({ parentId: id });
    if (hasChildren) {
      return res.error('Cannot delete category with subcategories', 400);
    }

    // 检查是否有商品使用此分类
    const Product = require('../models/product');
    const hasProducts = await Product.exists({ categoryId: id });
    if (hasProducts) {
      return res.error('Cannot delete category with associated products', 400);
    }

    await Category.findByIdAndDelete(id);
    res.success(null, 'Category deleted successfully');
  } catch (err) {
    res.error(err.message);
  }
});

module.exports = router;
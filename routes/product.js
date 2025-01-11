const express = require('express');
const multer = require('multer'); // 用于处理文件上传
const path = require('path');
const fs = require('fs');
const Product = require('../models/product');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'public/uploads/products';
    // 确保上传目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // 只允许上传图片
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 限制5MB
  }
});

// 创建新商品
router.post('/create', verifyToken, isAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const { name, price, description, categoryId, stock, specs } = req.body;
    
    // 处理上传的图片
    const images = req.files ? req.files.map(file => `/uploads/products/${file.filename}`) : [];
    
    const product = new Product({
      name,
      price: Number(price),
      description,
      categoryId,
      stock: Number(stock),
      images,
      specs: JSON.parse(specs || '[]')
    });
    
    await product.save();
    res.success(product, 'Product created successfully');
  } catch (err) {
    res.error(err.message, 400);
  }
});

// 更新商品
router.post('/update', verifyToken, isAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const { _id, name, price, description, categoryId, stock, specs, removeImages } = req.body;
    
    const product = await Product.findById(_id);
    if (!product) {
      return res.error('Product not found', 404);
    }
    
    // 处理要删除的图片
    if (removeImages) {
      const imagesToRemove = JSON.parse(removeImages);
      product.images = product.images.filter(img => !imagesToRemove.includes(img));
      
      // 从文件系统中删除图片
      imagesToRemove.forEach(img => {
        const filePath = path.join(__dirname, '../public', img);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
    
    // 添加新上传的图片
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/products/${file.filename}`);
      product.images = [...product.images, ...newImages];
    }
    
    // 更新其他字段
    if (name) product.name = name;
    if (price) product.price = Number(price);
    if (description) product.description = description;
    if (categoryId) product.categoryId = categoryId;
    if (stock) product.stock = Number(stock);
    if (specs) product.specs = JSON.parse(specs);
    
    await product.save();
    res.success(product, 'Product updated successfully');
  } catch (err) {
    res.error(err.message);
  }
});

// 获取商品列表
router.post('/list', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      categoryId, 
      keyword,
      sort = 'createdAt',
      order = 'desc',
      status = 'active'
    } = req.body;
    
    // 构建查询条件
    const query = { status };
    if (categoryId) query.categoryId = categoryId;
    if (keyword) {
      query.$or = [
        { name: new RegExp(keyword, 'i') },
        { description: new RegExp(keyword, 'i') }
      ];
    }
    
    // 计算总数
    const total = await Product.countDocuments(query);
    
    // 获取商品列表
    const products = await Product.find(query)
      .sort({ [sort]: order })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('categoryId', 'name');
    
    res.success({
      total,
      page: Number(page),
      limit: Number(limit),
      items: products
    });
  } catch (err) {
    res.error(err.message);
  }
});

// 获取商品详情
router.post('/detail', async (req, res) => {
  try {
    const { _id } = req.body;
    const product = await Product.findById(_id).populate('categoryId', 'name');
    
    if (!product) {
      return res.error('Product not found', 404);
    }
    
    res.success(product);
  } catch (err) {
    res.error(err.message);
  }
});

// 删除商品（软删除）
router.post('/delete', verifyToken, isAdmin, async (req, res) => {
  try {
    const { _id } = req.body;
    const product = await Product.findById(_id);
    
    if (!product) {
      return res.error('Product not found', 404);
    }
    
    product.status = 'deleted';
    await product.save();
    
    res.success(null, 'Product deleted successfully');
  } catch (err) {
    res.error(err.message);
  }
});

module.exports = router;
const express = require('express');
const multer = require('multer');
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
    // 获取原始文件的扩展名
    const ext = path.extname(file.originalname).toLowerCase();
    // 生成文件名: 时间戳-随机数.扩展名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // 只允许上传图片
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
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
router.post('/create', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, price, description, categoryId, stock, images } = req.body;
    let specs = [];
    
    // 解析 specs
    try {
      if (req.body.specs) {
        specs = JSON.parse(req.body.specs);
      }
    } catch (err) {
      console.error('Error parsing specs:', err);
    }
    console.log(images);
    const product = new Product({
      name,
      price: Number(price),
      description,
      categoryId,
      stock: Number(stock),
      images,
      specs
    });
    
    await product.save();
    
    // 获取完整的商品信息（包括关联的分类信息）
    const savedProduct = await Product.findById(product._id)
      .populate('categoryId', 'name');
    
    res.success(savedProduct, 'Product created successfully');
  } catch (err) {
    res.error(err.message, 400);
  }
});

// 更新商品
router.post('/update', verifyToken, isAdmin,  async (req, res) => {
  try {
    const { id, name, price, description, categoryId, stock, specs, images } = req.body;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.error('Product not found', 404);
    }
    // 添加新上传的图片,删除旧的图片
    const imagesToDelete = [];
    product.images.forEach(img => {
      if (!images.includes(img)) {
        imagesToDelete.push(img);
      }
    });
    
    imagesToDelete.forEach(img => {
      const filePath = path.join(__dirname, '../public', img);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting old image:', err);
      });
    });
    
    product.images = [...images];
    
    // 更新其他字段
    if (name) product.name = name;
    if (price) product.price = Number(price);
    if (description) product.description = description;
    if (categoryId) product.categoryId = categoryId;
    if (stock) product.stock = Number(stock);
    if (specs) {
      try {
        product.specs = JSON.parse(specs);
      } catch (err) {
        console.error('Error parsing specs:', err);
      }
    }
    
    await product.save();
    
    // 获取更新后的完整商品信息
    const updatedProduct = await Product.findById(id)
      .populate('categoryId', 'name');
    
    res.success(updatedProduct, 'Product updated successfully');
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
    
    // 获取商品列表，确保选择所有字段
    const products = await Product.find(query)
      .select('-__v') // 排除 __v 字段，但保留其他所有字段
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
    const { id } = req.body;
    const product = await Product.findById(id).populate('categoryId', 'name');
    
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
const express = require('express');
const Cart = require('../models/cart');
const Product = require('../models/product');
const { verifyToken } = require('../middlewares/authMiddleware');
const router = express.Router();

// 添加商品到购物车
router.post('/add', verifyToken, async (req, res) => {
  try {
    const { openid, productId, quantity = 1 } = req.body;

    // 验证商品是否存在
    const product = await Product.findById(productId);
    if (!product) {
      return res.error('Product not found', 404);
    }

    // 检查库存
    if (product.stock < quantity) {
      return res.error('Insufficient stock', 400);
    }

    // 查找或创建购物车
    let cart = await Cart.findOne({ openid });
    if (!cart) {
      cart = new Cart({ openid, items: [] });
    }

    // 检查商品是否已在购物车中
    const existingItem = cart.items.find(item => 
      item.productId.toString() === productId
    );

    if (existingItem) {
      // 更新数量
      existingItem.quantity += quantity;
      // 检查更新后的数量是否超过库存
      if (existingItem.quantity > product.stock) {
        return res.error('Quantity exceeds available stock', 400);
      }
    } else {
      // 添加新商品
      cart.items.push({ productId, quantity });
    }

    await cart.save();

    // 返回完整的购物车信息
    const populatedCart = await Cart.findById(cart._id)
      .populate('items.productId', 'name price images stock');

    res.success(populatedCart, 'Product added to cart successfully');
  } catch (err) {
    res.error(err.message);
  }
});

// 更新购物车商品数量
router.post('/update', verifyToken, async (req, res) => {
  try {
    const { openid, productId, quantity } = req.body;

    // 验证商品是否存在
    const product = await Product.findById(productId);
    if (!product) {
      return res.error('Product not found', 404);
    }

    // 检查库存
    if (product.stock < quantity) {
      return res.error('Insufficient stock', 400);
    }

    const cart = await Cart.findOne({ openid });
    if (!cart) {
      return res.error('Cart not found', 404);
    }

    const item = cart.items.find(item => 
      item.productId.toString() === productId
    );

    if (!item) {
      return res.error('Product not found in cart', 404);
    }

    item.quantity = quantity;
    await cart.save();

    // 返回更新后的购物车信息
    const populatedCart = await Cart.findById(cart._id)
      .populate('items.productId', 'name price images stock');

    res.success(populatedCart, 'Cart updated successfully');
  } catch (err) {
    res.error(err.message);
  }
});

// 从购物车移除商品
router.post('/remove', verifyToken, async (req, res) => {
  try {
    const { openid, productId } = req.body;

    const cart = await Cart.findOne({ openid });
    if (!cart) {
      return res.error('Cart not found', 404);
    }

    cart.items = cart.items.filter(item => 
      item.productId.toString() !== productId
    );

    await cart.save();

    // 返回更新后的购物车信息
    const populatedCart = await Cart.findById(cart._id)
      .populate('items.productId', 'name price images stock');

    res.success(populatedCart, 'Product removed from cart successfully');
  } catch (err) {
    res.error(err.message);
  }
});

// 获取购物车信息
router.post('/list', verifyToken, async (req, res) => {
  try {
    const { openid } = req.body;

    const cart = await Cart.findOne({ openid })
      .populate('items.productId', 'name price images stock');

    if (!cart) {
      // 如果购物车不存在，返回空购物车
      return res.success({ openid, items: [] });
    }

    // 过滤掉已下架或库存为0的商品
    cart.items = cart.items.filter(item => 
      item.productId && 
      item.productId.stock > 0
    );

    await cart.save();

    res.success(cart);
  } catch (err) {
    res.error(err.message);
  }
});

// 更新商品选中状态
router.post('/select', verifyToken, async (req, res) => {
  try {
    const { openid, productId, selected } = req.body;

    const cart = await Cart.findOne({ openid });
    if (!cart) {
      return res.error('Cart not found', 404);
    }

    const item = cart.items.find(item => 
      item.productId.toString() === productId
    );

    if (!item) {
      return res.error('Product not found in cart', 404);
    }

    item.selected = selected;
    await cart.save();

    // 返回更新后的购物车信息
    const populatedCart = await Cart.findById(cart._id)
      .populate('items.productId', 'name price images stock');

    res.success(populatedCart, 'Product selection updated successfully');
  } catch (err) {
    res.error(err.message);
  }
});

// 清空购物车
router.post('/clear', verifyToken, async (req, res) => {
  try {
    const { openid } = req.body;

    await Cart.findOneAndUpdate(
      { openid },
      { $set: { items: [] } },
      { new: true }
    );

    res.success(null, 'Cart cleared successfully');
  } catch (err) {
    res.error(err.message);
  }
});

module.exports = router;
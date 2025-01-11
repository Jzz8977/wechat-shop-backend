const express = require('express');
const Order = require('../models/order');
const Product = require('../models/product');
const { verifyToken } = require('../middlewares/authMiddleware');
const router = express.Router();

// 生成订单号
const generateOrderNo = () => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const timestamp = now.getTime().toString().slice(-6);
  return `${year}${month}${day}${random}${timestamp}`;
};

// 创建订单
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { 
      openid,
      products,
      address,
      remark
    } = req.body;

    if (!products || !products.length) {
      return res.error('Products are required', 400);
    }

    // 验证并获取商品信息
    let totalAmount = 0;
    const orderProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.error(`Product ${item.productId} not found`, 404);
      }
      if (product.stock < item.quantity) {
        return res.error(`Insufficient stock for product ${product.name}`, 400);
      }

      // 更新库存
      product.stock -= item.quantity;
      product.sales += item.quantity;
      await product.save();

      orderProducts.push({
        productId: product._id,
        quantity: item.quantity,
        price: product.price,
        name: product.name,
        image: product.images[0]
      });

      totalAmount += product.price * item.quantity;
    }

    const order = new Order({
      orderNo: generateOrderNo(),
      openid,
      products: orderProducts,
      address,
      totalAmount,
      remark
    });

    await order.save();

    res.success(order, 'Order created successfully');
  } catch (err) {
    res.error(err.message);
  }
});

// 获取订单列表
router.post('/list', verifyToken, async (req, res) => {
  try {
    const { 
      openid,
      page = 1, 
      limit = 10,
      status,
      startDate,
      endDate,
      sort = 'createdAt',
      order = 'desc'
    } = req.body;

    // 构建查询条件
    const query = { openid };
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // 计算总数
    const total = await Order.countDocuments(query);

    // 获取订单列表
    const orders = await Order.find(query)
      .sort({ [sort]: order })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('products.productId', 'name images price');

    res.success({
      total,
      page: Number(page),
      limit: Number(limit),
      items: orders
    });
  } catch (err) {
    res.error(err.message);
  }
});

// 获取订单详情
router.post('/detail', verifyToken, async (req, res) => {
  try {
    const { id } = req.body;

    const order = await Order.findById(id)
      .populate('products.productId', 'name images price description');

    if (!order) {
      return res.error('Order not found', 404);
    }

    res.success(order);
  } catch (err) {
    res.error(err.message);
  }
});

// 更新订单状态
router.post('/update-status', verifyToken, async (req, res) => {
  try {
    const { 
      id, 
      status,
      shippingInfo,
      refundReason 
    } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.error('Order not found', 404);
    }

    // 更新订单状态
    order.status = status;

    // 根据状态更新相关信息
    switch (status) {
      case 'paid':
        order.paymentStatus = 'paid';
        order.paymentTime = new Date();
        break;
      case 'shipped':
        if (!shippingInfo) {
          return res.error('Shipping information is required', 400);
        }
        order.shippingInfo = {
          ...shippingInfo,
          shippingTime: new Date()
        };
        break;
      case 'refunded':
        if (!refundReason) {
          return res.error('Refund reason is required', 400);
        }
        order.refundReason = refundReason;
        order.refundTime = new Date();
        order.paymentStatus = 'refunded';
        break;
      case 'cancelled':
        // 恢复库存
        for (const item of order.products) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { 
              stock: item.quantity,
              sales: -item.quantity
            }
          });
        }
        break;
    }

    await order.save();
    res.success(order, 'Order status updated successfully');
  } catch (err) {
    res.error(err.message);
  }
});

module.exports = router;
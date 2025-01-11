const express = require('express');
const Tenpay = require('tenpay');
const Payment = require('../models/payment');
const Order = require('../models/order');
const config = require('../config');
const { verifyToken } = require('../middlewares/authMiddleware');
const router = express.Router();

// 初始化微信支付
const tenpay = new Tenpay({
  appid: config.WECHAT_APPID,
  mchid: config.WECHAT_MCH_ID,
  partnerKey: config.WECHAT_PARTNER_KEY,
  notify_url: config.WECHAT_NOTIFY_URL,
  // 可选：证书文件路径
  // pfx: require('fs').readFileSync('证书文件路径')
});

// 创建支付订单
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { orderNo } = req.body;

    // 查找订单
    const order = await Order.findOne({ orderNo });
    if (!order) {
      return res.error('Order not found', 404);
    }

    if (order.status !== 'pending') {
      return res.error('Order status is not pending', 400);
    }

    // 检查是否已存在支付记录
    const existingPayment = await Payment.findOne({ orderNo });
    if (existingPayment && existingPayment.status === 'success') {
      return res.error('Order has been paid', 400);
    }

    // 创建微信支付统一下单
    const result = await tenpay.unifiedOrder({
      out_trade_no: orderNo,
      body: '商城订单',
      total_fee: Math.round(order.totalAmount * 100), // 转换为分
      openid: order.openid,
      trade_type: 'JSAPI'
    });

    // 创建支付记录
    const payment = new Payment({
      orderNo,
      openid: order.openid,
      amount: order.totalAmount,
      prepayId: result.prepay_id
    });
    await payment.save();

    // 生成支付参数
    const payParams = tenpay.getPayParams({
      prepay_id: result.prepay_id,
      package: 'prepay_id=' + result.prepay_id
    });

    res.success(payParams);
  } catch (err) {
    res.error(err.message);
  }
});

// 支付结果通知
router.post('/notify', async (req, res) => {
  try {
    // 验证通知数据
    const result = await tenpay.notify(req.body);

    // 处理支付结果
    const { out_trade_no, transaction_id, total_fee } = result;
    
    // 更新支付记录
    const payment = await Payment.findOne({ orderNo: out_trade_no });
    if (payment) {
      payment.status = 'success';
      payment.transactionId = transaction_id;
      payment.paymentTime = new Date();
      await payment.save();

      // 更新订单状态
      await Order.findOneAndUpdate(
        { orderNo: out_trade_no },
        { 
          status: 'paid',
          paymentStatus: 'paid',
          paymentTime: new Date()
        }
      );
    }

    res.success('SUCCESS');
  } catch (err) {
    console.error('Payment notification error:', err);
    res.error('FAIL');
  }
});

// 查询支付状态
router.post('/query', verifyToken, async (req, res) => {
  try {
    const { orderNo } = req.body;

    const payment = await Payment.findOne({ orderNo });
    if (!payment) {
      return res.error('Payment not found', 404);
    }

    // 查询微信支付订单
    const result = await tenpay.orderQuery({
      out_trade_no: orderNo
    });

    // 更新支付状态
    if (result.trade_state === 'SUCCESS' && payment.status !== 'success') {
      payment.status = 'success';
      payment.transactionId = result.transaction_id;
      payment.paymentTime = new Date();
      await payment.save();

      // 更新订单状态
      await Order.findOneAndUpdate(
        { orderNo },
        { 
          status: 'paid',
          paymentStatus: 'paid',
          paymentTime: new Date()
        }
      );
    }

    res.success({
      status: payment.status,
      paymentTime: payment.paymentTime
    });
  } catch (err) {
    res.error(err.message);
  }
});

// 申请退款
router.post('/refund', verifyToken, async (req, res) => {
  try {
    const { orderNo, refundAmount, refundReason } = req.body;

    const payment = await Payment.findOne({ orderNo });
    if (!payment) {
      return res.error('Payment not found', 404);
    }

    if (payment.status !== 'success') {
      return res.error('Payment status is not success', 400);
    }

    if (refundAmount > payment.amount) {
      return res.error('Refund amount exceeds payment amount', 400);
    }

    // 申请退款
    const result = await tenpay.refund({
      out_trade_no: orderNo,
      out_refund_no: 'refund_' + orderNo,
      total_fee: Math.round(payment.amount * 100),
      refund_fee: Math.round(refundAmount * 100)
    });

    // 更新支付记录
    payment.status = 'refunded';
    payment.refundAmount = refundAmount;
    payment.refundReason = refundReason;
    payment.refundTime = new Date();
    await payment.save();

    // 更新订单状态
    await Order.findOneAndUpdate(
      { orderNo },
      { 
        status: 'refunded',
        paymentStatus: 'refunded',
        refundReason,
        refundTime: new Date()
      }
    );

    res.success(null, 'Refund applied successfully');
  } catch (err) {
    res.error(err.message);
  }
});

module.exports = router; 
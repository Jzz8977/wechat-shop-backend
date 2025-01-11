const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNo: { 
    type: String, 
    required: true,
    unique: true
  },
  openid: { 
    type: String, 
    required: true,
    index: true
  },
  products: [{
    productId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product',
      required: true
    },
    quantity: { 
      type: Number, 
      required: true,
      min: 1
    },
    price: { 
      type: Number, 
      required: true,
      min: 0
    },
    name: String,
    image: String
  }],
  address: {
    name: String,
    phone: String,
    province: String,
    city: String,
    district: String,
    detail: String
  },
  totalAmount: { 
    type: Number, 
    required: true,
    min: 0
  },
  status: { 
    type: String, 
    enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['wechat', 'alipay'],
    default: 'wechat'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid'
  },
  paymentTime: Date,
  shippingInfo: {
    carrier: String,
    trackingNo: String,
    shippingTime: Date
  },
  remark: String,
  refundReason: String,
  refundTime: Date
}, { 
  timestamps: true 
});

// 创建复合索引
orderSchema.index({ openid: 1, createdAt: -1 });
orderSchema.index({ orderNo: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);

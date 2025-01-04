const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  conditions: { type: String },
  // ...其他优惠券信息字段...
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
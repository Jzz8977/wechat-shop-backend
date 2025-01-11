const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  // ...其他购物车信息字段...
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
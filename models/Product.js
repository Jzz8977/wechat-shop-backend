const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  images: [{ type: String }], // 商品图片URL数组
  stock: { type: Number, required: true, default: 0 },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: false },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'deleted'],
    default: 'active'
  },
  specs: [{
    name: String,
    value: String
  }], // 商品规格
  sales: { type: Number, default: 0 }, // 销量
  isRecommended: { type: Boolean, default: false }, // 是否推荐
  isNew: { type: Boolean, default: true }, // 是否新品
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
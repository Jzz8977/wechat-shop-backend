const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null }, // 父分类ID
  level: { type: Number, default: 1 }, // 分类层级：1-一级分类，2-二级分类
  order: { type: Number, default: 0 }, // 排序权重
  status: { 
    type: String, 
    enum: ['active', 'inactive'],
    default: 'active'
  },
  icon: { type: String }, // 分类图标URL
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
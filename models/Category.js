const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  // ...其他分类信息字段...
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);

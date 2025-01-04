const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  // ...其他库存信息字段...
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
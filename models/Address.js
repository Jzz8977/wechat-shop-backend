const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  recipientName: { type: String, required: true },
  address: { type: String, required: true },
  contactNumber: { type: String, required: true },
  // ...其他收货地址信息字段...
}, { timestamps: true });

module.exports = mongoose.model('Address', addressSchema);
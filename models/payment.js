const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderNo: { 
    type: String, 
    required: true,
    unique: true,
    index: true
  },
  openid: {
    type: String,
    required: true,
    index: true
  },
  transactionId: {
    type: String,
    sparse: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['wechat'],
    default: 'wechat'
  },
  prepayId: String,
  paymentTime: Date,
  refundTime: Date,
  refundAmount: Number,
  refundReason: String,
  errorMessage: String
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Payment', paymentSchema); 
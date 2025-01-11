const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  openid: { type: String, required: true, unique: true },
  nickName: { type: String },
  avatarUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema); 
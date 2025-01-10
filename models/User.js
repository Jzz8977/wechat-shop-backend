const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  openid: { type: String, required: true, unique: true },
  nickName: { type: String },
  avatarUrl: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
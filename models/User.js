const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nickname: { type: String },
  // ...其他用户信息字段...
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
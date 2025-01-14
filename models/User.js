const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String },
  password: { type: String },
  role: { 
    type: String, 
    enum: ['admin', 'user'], 
    default: 'user' 
  },
  permissions: [{
    type: String,
    enum: ['create_user', 'read_user', 'update_user', 'delete_user', 'manage_permissions']
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'banned'],
    default: 'active'
  }
}, { timestamps: true });

// 在保存之前加密密码
userSchema.pre('save', async function(next) {
  // 只有在密码被修改时才重新加密
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// 添加验证密码的方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
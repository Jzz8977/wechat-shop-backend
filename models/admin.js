const mongoose = require('mongoose');

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

module.exports = mongoose.model('User', userSchema);
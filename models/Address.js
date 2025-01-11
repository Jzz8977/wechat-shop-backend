const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  openid: { 
    type: String, 
    required: true,
    index: true
  },
  name: { 
    type: String, 
    required: true 
  },
  phone: { 
    type: String, 
    required: true 
  },
  province: { 
    type: String, 
    required: true 
  },
  city: { 
    type: String, 
    required: true 
  },
  district: { 
    type: String, 
    required: true 
  },
  detail: { 
    type: String, 
    required: true 
  },
  isDefault: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: true 
});

// 创建复合索引
addressSchema.index({ openid: 1, isDefault: -1 });

module.exports = mongoose.model('Address', addressSchema);
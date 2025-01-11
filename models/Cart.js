const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  openid: { 
    type: String, 
    required: true,
    index: true
  },
  items: [{
    productId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product',
      required: true
    },
    quantity: { 
      type: Number, 
      required: true,
      min: 1
    },
    selected: {
      type: Boolean,
      default: true
    }
  }]
}, { 
  timestamps: true 
});

// 创建索引
cartSchema.index({ openid: 1 });

module.exports = mongoose.model('Cart', cartSchema);
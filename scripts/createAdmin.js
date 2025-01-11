const mongoose = require('mongoose');
const config = require('../config');
const User = require('../models/user');

async function createAdminUser() {
  try {
    await mongoose.connect(config.db.uri, config.db.options);
    
    const adminUser = new User({
      openid: 'admin',
      nickName: 'Administrator',
      role: 'admin',
      permissions: ['create_user', 'read_user', 'update_user', 'delete_user', 'manage_permissions'],
      status: 'active'
    });
    
    await adminUser.save();
    console.log('Admin user created successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin user:', err);
    process.exit(1);
  }
}

createAdminUser(); 
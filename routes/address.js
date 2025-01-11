const express = require('express');
const Address = require('../models/address');
const { verifyToken } = require('../middlewares/authMiddleware');
const router = express.Router();

// 新增地址
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { 
      openid,
      name,
      phone,
      province,
      city,
      district,
      detail,
      isDefault = false
    } = req.body;

    // 如果设置为默认地址，先将其他地址的默认状态取消
    if (isDefault) {
      await Address.updateMany(
        { openid, isDefault: true },
        { $set: { isDefault: false } }
      );
    }

    const address = new Address({
      openid,
      name,
      phone,
      province,
      city,
      district,
      detail,
      isDefault
    });

    await address.save();
    res.success(address, 'Address created successfully');
  } catch (err) {
    res.error(err.message, 400);
  }
});

// 编辑地址
router.post('/update', verifyToken, async (req, res) => {
  try {
    const { 
      _id,
      name,
      phone,
      province,
      city,
      district,
      detail,
      isDefault = false
    } = req.body;

    const address = await Address.findById(_id);
    if (!address) {
      return res.error('Address not found', 404);
    }

    // 如果设置为默认地址，先将其他地址的默认状态取消
    if (isDefault && !address.isDefault) {
      await Address.updateMany(
        { openid: address.openid, isDefault: true },
        { $set: { isDefault: false } }
      );
    }

    // 更新地址信息
    address.name = name || address.name;
    address.phone = phone || address.phone;
    address.province = province || address.province;
    address.city = city || address.city;
    address.district = district || address.district;
    address.detail = detail || address.detail;
    address.isDefault = isDefault;

    await address.save();
    res.success(address, 'Address updated successfully');
  } catch (err) {
    res.error(err.message);
  }
});

// 获取地址列表
router.post('/list', verifyToken, async (req, res) => {
  try {
    const { openid } = req.body;
    
    if (!openid) {
      return res.error('OpenID is required', 400);
    }

    // 获取该用户的所有地址，默认地址排在前面
    const addresses = await Address.find({ openid })
      .sort({ isDefault: -1, createdAt: -1 });

    res.success(addresses);
  } catch (err) {
    res.error(err.message);
  }
});

// 删除地址
router.post('/delete', verifyToken, async (req, res) => {
  try {
    const { _id } = req.body;

    const address = await Address.findById(_id);
    if (!address) {
      return res.error('Address not found', 404);
    }

    await address.remove();
    res.success(null, 'Address deleted successfully');
  } catch (err) {
    res.error(err.message);
  }
});

// 设置默认地址
router.post('/set-default', verifyToken, async (req, res) => {
  try {
    const { _id } = req.body;

    const address = await Address.findById(_id);
    if (!address) {
      return res.error('Address not found', 404);
    }

    // 取消其他默认地址
    await Address.updateMany(
      { openid: address.openid, isDefault: true },
      { $set: { isDefault: false } }
    );

    // 设置新的默认地址
    address.isDefault = true;
    await address.save();

    res.success(address, 'Default address set successfully');
  } catch (err) {
    res.error(err.message);
  }
});

module.exports = router;
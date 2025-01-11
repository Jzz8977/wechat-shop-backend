const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { connectDB } = require('./db/db'); // 解构导入 connectDB 函数
const responseHandler = require('./middlewares/responseHandler');
const customerRoutes = require('./routes/customer'); // 引入用户路由
const productRoutes = require('./routes/product'); // 引入产品路由  
const orderRoutes = require('./routes/order'); // 引入订单路由
const cartRoutes = require('./routes/cart'); // 引入购物车路由
const addressRoutes = require('./routes/address'); // 引入地址路由
const categoryRoutes = require('./routes/category'); // 引入分类路由
// const couponRoutes = require('./routes/coupon'); // 引入优惠券路由
const inventoryRoutes = require('./routes/inventory'); // 引入库存路由
const userRoutes = require('./routes/user');
const uploadRoutes = require('./routes/upload');

const app = express();
let port = 5001; // 修改为 let

// 添加带宽限制（可选）
const throttle = require('express-throttle-bandwidth');
app.use(throttle(1024 * 128)); 
// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(responseHandler); // 使用封装状态码返回值的中间件

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')

  console.log(`${req.method} ${req.url}`);
  next();
});

// 添加错误处理中间件
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ 
      status: 'error',
      message: 'Invalid JSON format' 
    });
  }
  next();
});

// 连接数据库
connectDB();

// 示例 API 路由

// 使用用户路由
app.use('/api/wxusers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/categories', categoryRoutes);
// app.use('/api/coupons', couponRoutes);
app.use('/api/inventories', inventoryRoutes);
app.use('/api/users', userRoutes);

// 注册上传路由
app.use('/api/upload', uploadRoutes);

// 添加静态文件服务
app.use('/uploads', express.static('public/uploads'));
// 限制带宽为 128KB/s

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
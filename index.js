const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { connectDB } = require('./db'); // 解构导入 connectDB 函数
const responseHandler = require('./middlewares/responseHandler');

const app = express();
let port = process.env.PORT || 5001; // 修改为 let

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(responseHandler); // 使用封装状态码返回值的中间件

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// 连接数据库
connectDB();

// 示例 API 路由

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
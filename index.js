const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { connectDB } = require('./db'); // 解构导入 connectDB 函数

const app = express();
let port = process.env.PORT || 5001; // 修改为 let

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 示例路由
app.get('/', (req, res) => {
  res.send('Hello, WeChat Mini Program!');
});

// 连接数据库
connectDB();

// 示例 API 路由

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
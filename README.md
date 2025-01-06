# WeChat MiniApp Backend

## 项目简介
这是一个为微信小程序提供后端服务的项目，使用Express框架构建，支持跨域请求和JSON解析。

## 主要功能模块

### 1. 服务器设置
- 使用Express框架搭建HTTP服务器
- 支持跨域请求（CORS）
- 解析JSON和URL编码的请求体

### 2. 中间件
- 使用`body-parser`解析请求体
- 使用自定义中间件`responseHandler`处理响应
- 日志中间件记录每个请求的HTTP方法和URL

### 3. 数据库连接
- 使用Mongoose连接MongoDB数据库
- 提供`connectDB`函数用于数据库连接

### 4. 示例API路由
- 提供基本的API路由示例（可扩展）

## 技术栈
- 服务器框架：Express
- 数据库：MongoDB (通过Mongoose连接)
- 中间件：body-parser, cors
- 开发工具：Nodemon

## 快速开始

### 安装依赖
npm install
### 开发环境运行
npm run dev

## 项目结构
├── index.js # 应用入口
├── db.js # 数据库连接模块
├── middlewares/ # 中间件
└── package.json # 项目配置文件


## 环境要求
- Node.js 16+
- npm 7+
- MongoDB 数据库

## 配置说明
在项目根目录创建 `.env` 文件以配置环境变量：
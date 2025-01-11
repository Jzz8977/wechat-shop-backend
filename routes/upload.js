const express = require('express');
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const { verifyToken } = require('../middlewares/authMiddleware');
const router = express.Router();

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置 formidable
const createForm = () => {
  const form = new formidable.IncomingForm();
  
  // 设置上传目录
  form.uploadDir = uploadDir;
  // 保持文件扩展名
  form.keepExtensions = true;
  // 设置文件大小限制 (10MB)
  form.maxFileSize = 10 * 1024 * 1024;
  // 允许多文件上传
  form.multiples = true;
  // 解析多文件
  form.multipart = true;

  return form;
};

// 单文件或多文件上传
router.post('/upload', async (req, res) => {
  console.log('Upload request received');
  
  const form = createForm();
  const uploadedFiles = [];

  // 监听每个文件上传
  form.on('file', (field, file) => {
    console.log(`Receiving file: ${file.originalFilename}`);
    
    try {
      const fileInfo = {
        url: `/uploads/${path.basename(file.filepath)}`,
        originalName: file.originalFilename || 'unknown',
        size: file.size || 0,
        mimetype: file.mimetype || 'application/octet-stream'
      };
      uploadedFiles.push(fileInfo);
      console.log('File processed:', fileInfo);
    } catch (err) {
      console.error('Error processing file:', err);
    }
  });

  // 处理错误
  form.on('error', err => {
    console.error('Form error:', err);
    return res.error(err.message, 400);
  });

  // 处理完成
  form.on('end', () => {
    console.log('Upload completed, total files:', uploadedFiles.length);
    if (uploadedFiles.length === 0) {
      return res.error('No files uploaded', 400);
    }
    return res.success(uploadedFiles, 'Upload successful');
  });

  // 开始解析
  try {
    await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Parse error:', err);
          reject(err);
          return;
        }
        resolve();
      });
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.error(err.message);
  }
});

// 删除文件
router.post('/delete', verifyToken, async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.error('File URL is required', 400);
    }
    
    // 确保路径安全，只允许访问 uploads 目录
    const fileName = path.basename(url);
    const filePath = path.join(uploadDir, fileName);
    
    if (!fs.existsSync(filePath)) {
      return res.error('File not found', 404);
    }
    
    fs.unlinkSync(filePath);
    res.success(null, 'File deleted successfully');
  } catch (err) {
    res.error(err.message);
  }
});

module.exports = router;
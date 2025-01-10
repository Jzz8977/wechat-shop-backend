module.exports = {
    db: {
      uri: 'mongodb://0.0.0.0:27017/wechat-miniapp',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true
      },
    },
    WECHAT_APPID: 'wx3b84f60568eca8cd',
    WECHAT_SECRET: 'deb95bda40dfe1a37cfc2f4b96989d93',
    JWT_SECRET: 'process.env.JWT_SECRET',
  };
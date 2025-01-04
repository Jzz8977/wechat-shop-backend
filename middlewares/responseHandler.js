const responseHandler = (req, res, next) => {
    res.success = (data) => {
      res.status(200).json({
        status: 'success',
        data,
      });
    };
  
    res.error = (message, statusCode = 500) => {
      res.status(statusCode).json({
        status: 'error',
        message,
      });
    };
  
    next();
  };
  
  module.exports = responseHandler;
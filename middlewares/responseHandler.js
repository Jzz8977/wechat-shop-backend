module.exports = (req, res, next) => {
  if (req.body) {
    console.log('Request Body:', req.body);
  }

  res.success = (data, message = 'Success', statusCode = 200) => {
    res.status(statusCode).json({
      status: 'success',
      message,
      data,
    });
  };

  res.error = (message = 'Error', statusCode = 500, data = null) => {
    res.status(statusCode).json({
      status: 'error',
      message,
      data,
    });
  };

  next();
};
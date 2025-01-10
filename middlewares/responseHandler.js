module.exports = (req, res, next) => {
  res.success = (data, message = 'Success', statusCode = 200) => {
    console.log('21321', data)
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
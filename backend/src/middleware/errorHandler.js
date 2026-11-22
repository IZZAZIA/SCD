const { AppError } = require('../utils/errors');

function notFound(req, _res, next) {
  next(new AppError(`No route for ${req.method} ${req.originalUrl}`, 404));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: { message: err.message, details: err.details } });
  }
  console.error(err);
  res.status(500).json({ error: { message: 'Something went wrong on the server.' } });
}
module.exports = { notFound, errorHandler };

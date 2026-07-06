export function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      message: `Route not found: ${req.method} ${req.originalUrl}`
    }
  });
}

export function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';
  const message = status === 500 && isProduction ? 'Something went wrong.' : err.message || 'Something went wrong.';

  if (status === 500) {
    console.error(err);
  }

  res.status(status).json({
    error: {
      message,
      ...(status === 500 && !isProduction && err.stack ? { detail: err.stack } : {})
    }
  });
}

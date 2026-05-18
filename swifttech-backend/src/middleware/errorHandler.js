const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err);

  // Validation errors from express-validator
  if (err.type === 'validation') {
    return res.status(400).json({ error: 'Validation failed', details: err.errors });
  }

  // PostgreSQL unique constraint
  if (err.code === '23505') {
    const field = err.detail?.match(/\((.+?)\)/)?.[1] || 'field';
    return res.status(409).json({ error: `${field} already exists` });
  }

  // PostgreSQL foreign key
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Referenced resource not found' });
  }

  // PostgreSQL check constraint
  if (err.code === '23514') {
    return res.status(400).json({ error: 'Invalid value for field' });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    error: process.env.NODE_ENV === 'production' && status === 500
      ? 'Internal server error'
      : message,
    ...(process.env.NODE_ENV !== 'production' && status === 500 && { stack: err.stack }),
  });
};

const notFound = (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
};

module.exports = { errorHandler, notFound };

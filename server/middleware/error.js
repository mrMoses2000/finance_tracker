import { NODE_ENV } from '../config/env.js';

export const notFound = (req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || err.status || 500;
  const payload = {
    error: err.isOperational ? err.message : err.message || 'Internal Server Error',
  };

  if (NODE_ENV !== 'production') {
    payload.stack = err.stack;
  }

  return res.status(statusCode).json(payload);
};

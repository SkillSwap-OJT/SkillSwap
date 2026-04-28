import { ApiError } from '../utils/ApiError.js';

export function notFoundHandler(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const payload = {
    error: err.message || 'Internal server error',
  };
  if (err.details) payload.details = err.details;
  if (process.env.NODE_ENV !== 'production' && status >= 500) {
    payload.stack = err.stack;
  }
  if (status >= 500) {
    console.error('[error]', err);
  }
  res.status(status).json(payload);
}

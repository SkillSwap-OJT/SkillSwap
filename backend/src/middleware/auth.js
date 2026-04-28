import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { unauthorized } from '../utils/ApiError.js';

export function signToken(payload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

export function requireAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(unauthorized('Missing bearer token'));
  try {
    const decoded = verifyToken(token);
    req.user = { id: decoded.sub, email: decoded.email };
    next();
  } catch (err) {
    next(unauthorized('Invalid or expired token'));
  }
}

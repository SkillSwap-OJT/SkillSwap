import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';

import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';
import skillRoutes from './routes/skill.routes.js';
import examRoutes from './routes/exam.routes.js';
import matchRoutes from './routes/match.routes.js';
import requestRoutes from './routes/request.routes.js';
import sessionRoutes from './routes/session.routes.js';
import messageRoutes from './routes/message.routes.js';
import ratingRoutes from './routes/rating.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();
  const explicitOrigins = new Set([
    env.clientOrigin,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'https://localhost:5173',
    'https://localhost:5174',
    'https://127.0.0.1:5173',
    'https://127.0.0.1:5174',
  ].filter(Boolean));

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || explicitOrigins.has(origin) || isAllowedLocalNetworkOrigin(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

  // Serve uploaded study materials as static files
  app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

  const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api', apiLimiter);

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'skillswap-backend', time: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/skills', skillRoutes);
  app.use('/api/exams', examRoutes);
  app.use('/api/match', matchRoutes);
  app.use('/api/requests', requestRoutes);
  app.use('/api/sessions', sessionRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/ratings', ratingRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

function isAllowedLocalNetworkOrigin(origin) {
  return /^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(origin);
}

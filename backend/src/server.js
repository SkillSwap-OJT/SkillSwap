import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { createApp } from './app.js';
import { registerChatSocket } from './sockets/chat.socket.js';

async function main() {
  await connectDB(env.mongoUri);

  const app = createApp();
  const server = http.createServer(app);
  const allowedOrigins = [
    env.clientOrigin,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'https://localhost:5173',
    'https://localhost:5174',
    'https://127.0.0.1:5173',
    'https://127.0.0.1:5174',
  ].filter(Boolean);

  const io = new SocketIOServer(server, {
    cors: {
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || isAllowedLocalNetworkOrigin(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
    },
  });
  app.set('io', io);

  registerChatSocket(io);

  server.listen(env.port, () => {
    console.log(`[server] listening on http://localhost:${env.port}`);
    console.log(`[server] CORS origin: ${env.clientOrigin}`);
  });
}

function isAllowedLocalNetworkOrigin(origin) {
  return /^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(origin);
}

main().catch((err) => {
  console.error('[fatal]', err);
  process.exit(1);
});

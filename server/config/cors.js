import { CORS_ALLOW_ALL, CORS_ORIGINS, NODE_ENV } from './env.js';

const defaultOrigins = NODE_ENV === 'production'
  ? []
  : ['http://localhost:3000', 'http://localhost:5173'];

const allowedOrigins = new Set([...defaultOrigins, ...CORS_ORIGINS]);

export const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (CORS_ALLOW_ALL) {
      return callback(null, true);
    }

    if (allowedOrigins.size === 0) {
      return callback(null, true);
    }

    if (allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type'],
};

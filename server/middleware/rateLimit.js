import { rateLimit } from 'express-rate-limit';
import {
  RATE_LIMIT_AUTH_MAX,
  RATE_LIMIT_AUTH_WINDOW_MS,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS,
} from '../config/env.js';

const standardHeaders = 'draft-7';

export const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  limit: RATE_LIMIT_MAX,
  standardHeaders,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
  skip: (req) => req.path.startsWith('/auth'),
});

export const authLimiter = rateLimit({
  windowMs: RATE_LIMIT_AUTH_WINDOW_MS,
  limit: RATE_LIMIT_AUTH_MAX,
  standardHeaders,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again later.' },
});

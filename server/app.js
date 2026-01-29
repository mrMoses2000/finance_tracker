import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { corsOptions } from './config/cors.js';
import authRouter from './routes/auth.js';
import apiRouter from './routes/api.js';
import clawdRouter from './routes/clawd.js';
import ratesRouter from './routes/rates.js';
import { errorHandler, notFound } from './middleware/error.js';
import { requireAuth } from './middleware/auth.js';
import { authLimiter, apiLimiter } from './middleware/rateLimit.js';
import { NODE_ENV, RATE_LIMIT_ENABLED, TRUST_PROXY } from './config/env.js';

const app = express();

app.disable('x-powered-by');
if (TRUST_PROXY) {
  app.set('trust proxy', 1);
}
app.use(cors(corsOptions));
app.use(express.json());

const shouldRateLimit = RATE_LIMIT_ENABLED && NODE_ENV !== 'test';

if (shouldRateLimit) {
  app.use(apiLimiter);
}

if (shouldRateLimit) {
  app.use('/auth', authLimiter, authRouter);
} else {
  app.use('/auth', authRouter);
}

app.use('/api', ratesRouter);
app.use('/api', apiRouter);
app.use('/api/clawd', requireAuth, clawdRouter);

app.use(notFound);
app.use(errorHandler);

export default app;

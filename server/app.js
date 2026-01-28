import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { corsOptions } from './config/cors.js';
import authRouter from './routes/auth.js';
import apiRouter from './routes/api.js';
import clawdRouter from './routes/clawd.js';
import { errorHandler, notFound } from './middleware/error.js';
import { requireAuth } from './middleware/auth.js';

const app = express();

app.disable('x-powered-by');
app.use(cors(corsOptions));
app.use(express.json());

app.use('/auth', authRouter);
app.use('/api', apiRouter);
app.use('/api/clawd', requireAuth, clawdRouter);

app.use(notFound);
app.use(errorHandler);

export default app;

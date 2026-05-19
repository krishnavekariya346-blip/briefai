import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import { initEmailTransport } from './services/emailService.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import briefRoutes from './routes/briefs.js';
import proposalRoutes from './routes/proposals.js';
import billingRoutes from './routes/billing.js';
import webhookRoutes from './routes/webhooks.js';

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

app.post(
  '/api/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  webhookRoutes
);

app.use(express.json());
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many requests, try again later' },
});

const generateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { error: 'Generation rate limit reached' },
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'briefai-api' });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/briefs', briefRoutes);
app.use('/api/proposals', generateLimiter, proposalRoutes);
app.use('/api/billing', billingRoutes);

app.use(errorHandler);

await connectDB();
await initEmailTransport();

const server = app.listen(PORT, () => {
  console.log(`BriefAI API running on http://localhost:${PORT}`);
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `\nPort ${PORT} is already in use. Another BriefAI server may still be running.\n` +
        `Fix: close the other terminal, or run:\n` +
        `  netstat -ano | findstr :${PORT}\n` +
        `  taskkill /PID <PID> /F\n`
    );
    process.exit(1);
  }
  throw err;
});

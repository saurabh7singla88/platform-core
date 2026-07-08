import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { timelineRouter } from './routes/timeline';
import { eventsRouter } from './routes/events';
import { ingestRouter } from './routes/ingest';
import { adminRouter } from './routes/admin';
import { webhooksRouter } from './routes/webhooks';

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (process.env.NODE_ENV !== 'production' || !origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  }),
);
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/v1', timelineRouter);
app.use('/api/v1', eventsRouter);
app.use('/ingest', ingestRouter);
app.use('/admin', adminRouter);
app.use('/webhooks', webhooksRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;

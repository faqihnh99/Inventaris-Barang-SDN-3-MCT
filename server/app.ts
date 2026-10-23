import express from 'express';
import { apiRouter } from './routes';

export function createApp() {
  const app = express();

  // Generous limit for Excel exports/imports and photos
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // CORS headers
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Support both /api prefix and root routing for Vercel serverless rewrites
  app.use('/api', apiRouter);
  app.use('/', apiRouter);

  return app;
}

export const app = createApp();
export default app;

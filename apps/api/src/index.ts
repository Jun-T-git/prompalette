import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';

import { corsOrigins, env } from './config/env.js';
import { logger } from './config/logger.js';
import { healthRoute } from './routes/health.js';
import { promptsRoute } from './routes/prompts.js';

const app = new Hono();

app.use('*', honoLogger());
app.use(
  '*',
  cors({
    origin: corsOrigins,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

app.route('/api/v1/prompts', promptsRoute);
app.route('/api/v1/health', healthRoute);

app.get('/', (c) => {
  return c.json({
    message: 'PromPalette API Server',
    version: '0.0.1',
    environment: env.NODE_ENV,
    endpoints: {
      health: '/api/v1/health',
      prompts: '/api/v1/prompts',
    },
  });
});

logger.info({
  port: env.PORT,
  environment: env.NODE_ENV,
  corsOrigins,
}, 'PromPalette API Server starting');

export default app;
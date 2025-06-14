import { Hono } from 'hono';

import { env } from '../config/env.js';

const health = new Hono();

health.get('/', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
    version: '0.0.1',
  });
});

export { health as healthRoute };
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';

import { corsOrigins, env } from './config/env.js';
import { logger } from './config/logger.js';
import { authMiddleware, requestIdMiddleware } from './middleware/auth.js';
import { healthRoute } from './routes/health.js';
import { promptsRoute } from './routes/prompts.js';

const packageJson = await import('../package.json', { assert: { type: 'json' } });

const app = new Hono();

// Request ID for tracing
app.use('*', requestIdMiddleware());

// Logging
app.use('*', honoLogger());

// Security headers
app.use('*', async (c, next) => {
  // Security headers
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy - restrictive for API server
  c.header('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
  
  // Only set HSTS in production with HTTPS
  if (env.NODE_ENV === 'production') {
    c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // Remove potentially revealing headers
  c.header('Server', '');
  c.header('X-Powered-By', '');
  
  await next();
});

// CORS
app.use(
  '*',
  cors({
    origin: corsOrigins,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposeHeaders: ['X-Request-ID'],
  })
);

// Authentication for API routes (except health)
app.use('/api/v1/prompts/*', authMiddleware({ required: true }));

// Health check (no auth required)
app.route('/api/v1/health', healthRoute);

// Protected routes
app.route('/api/v1/prompts', promptsRoute);

app.get('/', (c) => {
  return c.json({
    message: 'PromPalette API Server',
    version: packageJson.default.version,
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
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('8080'),
  CORS_ORIGINS: z.string().default('http://localhost:3000,http://localhost:5173'),
  DATABASE_PATH: z.string().default('./data/prompts.db'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type Environment = z.infer<typeof envSchema>;

let env: Environment;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  console.error('❌ Invalid environment variables:', error);
  process.exit(1);
}

export { env };

// Helper functions for backwards compatibility
export const isProduction = env.NODE_ENV === 'production';
export const corsOrigins = env.CORS_ORIGINS.split(',');
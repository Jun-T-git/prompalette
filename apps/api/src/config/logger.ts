import pino from 'pino';

import { env, isProduction } from './env.js';

export const logger = pino({
  level: env.LOG_LEVEL,
  transport: (isProduction || env.NODE_ENV === 'test')
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
});
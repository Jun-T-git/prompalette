type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

function isValidLogLevel(level: string): level is LogLevel {
  return ['debug', 'info', 'warn', 'error'].includes(level)
}

interface LoggerConfig {
  logLevel?: LogLevel | string
  nodeEnv?: string
}

class Logger {
  private config: LoggerConfig

  constructor(config: LoggerConfig = {}) {
    this.config = config
  }

  private getLogLevel(): LogLevel {
    const level = this.config.logLevel || import.meta.env.VITE_LOG_LEVEL || 'info'
    return isValidLogLevel(level) ? level : 'info'
  }

  private getNodeEnv(): string {
    return this.config.nodeEnv || import.meta.env.VITE_NODE_ENV || 'production'
  }

  private shouldLog(level: LogLevel): boolean {
    const nodeEnv = this.getNodeEnv()
    if (nodeEnv === 'production') {
      return level === 'error'
    }
    const currentLogLevel = this.getLogLevel()
    return LOG_LEVELS[level] >= LOG_LEVELS[currentLogLevel]
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug(`[DEBUG] ${message}`, ...args)
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(`[INFO] ${message}`, ...args)
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, ...args)
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(`[ERROR] ${message}`, ...args)
    }
  }
}

export const logger = new Logger()
export { Logger }
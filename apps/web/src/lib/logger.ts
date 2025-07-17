/**
 * 構造化ログユーティリティ
 * 本番環境での運用を考慮した適切なログ出力
 */

export interface LogContext {
  [key: string]: unknown;
}

export interface ErrorLogContext extends LogContext {
  error?: string;
  stack?: string;
  url?: string;
  method?: string;
  statusCode?: number;
}

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class ProductionLogger {
  private static instance: ProductionLogger;
  private readonly isProduction: boolean;
  private readonly logLevel: LogLevel;

  private constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.logLevel = this.isProduction ? LogLevel.ERROR : LogLevel.DEBUG;
  }

  static getInstance(): ProductionLogger {
    if (!ProductionLogger.instance) {
      ProductionLogger.instance = new ProductionLogger();
    }
    return ProductionLogger.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private sanitizeForProduction(context: LogContext): LogContext {
    if (!this.isProduction) return context;
    
    // 本番環境では機密情報を除去
    const sanitized = { ...context };
    delete sanitized.stack;
    delete sanitized.error;
    return sanitized;
  }

  logError(message: string, context: ErrorLogContext = {}): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    const sanitizedContext = this.sanitizeForProduction(context);
    const logEntry = {
      level: 'error',
      message: this.isProduction ? 'Internal server error' : message,
      timestamp: new Date().toISOString(),
      ...sanitizedContext,
    };
    
    console.error(JSON.stringify(logEntry));
  }

  logInfo(message: string, context: LogContext = {}): void {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const sanitizedContext = this.sanitizeForProduction(context);
    const logEntry = {
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...sanitizedContext,
    };
    
    console.log(JSON.stringify(logEntry));
  }

  logWarn(message: string, context: LogContext = {}): void {
    if (!this.shouldLog(LogLevel.WARN)) return;

    const sanitizedContext = this.sanitizeForProduction(context);
    const logEntry = {
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      ...sanitizedContext,
    };
    
    console.warn(JSON.stringify(logEntry));
  }

  logDebug(message: string, context: LogContext = {}): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;

    const logEntry = {
      level: 'debug',
      message,
      timestamp: new Date().toISOString(),
      ...context,
    };
    
    console.debug(JSON.stringify(logEntry));
  }
}

const logger = ProductionLogger.getInstance();

/**
 * 構造化エラーログを出力
 */
export function logError(message: string, context: ErrorLogContext = {}): void {
  logger.logError(message, context);
}

/**
 * 構造化情報ログを出力
 */
export function logInfo(message: string, context: LogContext = {}): void {
  logger.logInfo(message, context);
}

/**
 * 構造化警告ログを出力
 */
export function logWarn(message: string, context: LogContext = {}): void {
  logger.logWarn(message, context);
}

/**
 * 構造化デバッグログを出力
 */
export function logDebug(message: string, context: LogContext = {}): void {
  logger.logDebug(message, context);
}

/**
 * Errorオブジェクトから安全にメッセージとスタックトレースを抽出
 */
export function extractErrorInfo(error: unknown): { message: string; stack?: string } {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
    };
  }
  
  return {
    message: String(error),
  };
}
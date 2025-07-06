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

/**
 * 構造化エラーログを出力
 */
export function logError(message: string, context: ErrorLogContext = {}): void {
  const logEntry = {
    level: 'error',
    message,
    timestamp: new Date().toISOString(),
    ...context,
  };
  
  console.error(JSON.stringify(logEntry));
}

/**
 * 構造化情報ログを出力
 */
export function logInfo(message: string, context: LogContext = {}): void {
  const logEntry = {
    level: 'info',
    message,
    timestamp: new Date().toISOString(),
    ...context,
  };
  
  console.log(JSON.stringify(logEntry));
}

/**
 * 構造化警告ログを出力
 */
export function logWarn(message: string, context: LogContext = {}): void {
  const logEntry = {
    level: 'warn',
    message,
    timestamp: new Date().toISOString(),
    ...context,
  };
  
  console.warn(JSON.stringify(logEntry));
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
/**
 * プロダクションレベルのエラーハンドリングシステム
 */

export interface FormError {
  field: string;
  message: string;
  code?: string;
}

export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export class AppErrorHandler {
  private errors: Record<string, FormError> = {};
  private globalError: AppError | null = null;

  /**
   * フィールドレベルのエラーを設定
   */
  setFieldError(field: string, message: string, code?: string): void {
    this.errors[field] = { field, message, code };
  }

  /**
   * フィールドレベルのエラーを取得
   */
  getFieldError(field: string): FormError | null {
    return this.errors[field] || null;
  }

  /**
   * すべてのフィールドエラーを取得
   */
  getFieldErrors(): Record<string, FormError> {
    return { ...this.errors };
  }

  /**
   * フィールドエラーをクリア
   */
  clearFieldError(field: string): void {
    delete this.errors[field];
  }

  /**
   * すべてのエラーをクリア
   */
  clearAllErrors(): void {
    this.errors = {};
    this.globalError = null;
  }

  /**
   * グローバルエラーを設定
   */
  setGlobalError(code: string, message: string, details?: Record<string, unknown>): void {
    this.globalError = {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * グローバルエラーを取得
   */
  getGlobalError(): AppError | null {
    return this.globalError;
  }

  /**
   * エラーの存在チェック
   */
  hasErrors(): boolean {
    return Object.keys(this.errors).length > 0 || this.globalError !== null;
  }

  /**
   * フィールドエラーの存在チェック
   */
  hasFieldErrors(): boolean {
    return Object.keys(this.errors).length > 0;
  }
}

/**
 * 標準的なエラーメッセージ
 */
export const ERROR_MESSAGES = {
  REQUIRED: 'この項目は必須です',
  INVALID_EMAIL: 'メールアドレスの形式が正しくありません',
  INVALID_URL: 'URLの形式が正しくありません',
  TOO_SHORT: (min: number) => `${min}文字以上で入力してください`,
  TOO_LONG: (max: number) => `${max}文字以下で入力してください`,
  NETWORK_ERROR: 'ネットワークエラーが発生しました',
  UNAUTHORIZED: '認証が必要です',
  FORBIDDEN: 'アクセス権限がありません',
  NOT_FOUND: 'リソースが見つかりません',
  INTERNAL_ERROR: '内部エラーが発生しました',
  VALIDATION_ERROR: '入力内容に問題があります',
} as const;

/**
 * エラーコード
 */
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
} as const;

/**
 * HTTPステータスコードからエラーメッセージを取得
 */
export function getErrorMessageFromStatus(status: number): string {
  switch (status) {
    case 400:
      return ERROR_MESSAGES.VALIDATION_ERROR;
    case 401:
      return ERROR_MESSAGES.UNAUTHORIZED;
    case 403:
      return ERROR_MESSAGES.FORBIDDEN;
    case 404:
      return ERROR_MESSAGES.NOT_FOUND;
    case 429:
      return 'リクエストが多すぎます。しばらくしてから再試行してください';
    case 500:
    case 502:
    case 503:
    case 504:
      return ERROR_MESSAGES.INTERNAL_ERROR;
    default:
      return ERROR_MESSAGES.NETWORK_ERROR;
  }
}

/**
 * APIレスポンスエラーを処理
 */
export async function handleApiError(response: Response): Promise<AppError> {
  const status = response.status;
  let details: Record<string, unknown> = {};
  
  try {
    const errorData = await response.json();
    details = errorData;
  } catch {
    // JSON parsing failed, use default details
    details = { status, statusText: response.statusText };
  }

  return {
    code: `HTTP_${status}`,
    message: getErrorMessageFromStatus(status),
    details,
    timestamp: new Date().toISOString(),
  };
}

/**
 * 汎用エラーハンドラー
 */
export function handleGenericError(error: unknown): AppError {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (error instanceof Error) {
    return {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: isProduction ? ERROR_MESSAGES.INTERNAL_ERROR : error.message,
      details: isProduction ? {} : { stack: error.stack },
      timestamp: new Date().toISOString(),
    };
  }

  return {
    code: ERROR_CODES.INTERNAL_ERROR,
    message: ERROR_MESSAGES.INTERNAL_ERROR,
    details: isProduction ? {} : { originalError: error },
    timestamp: new Date().toISOString(),
  };
}

/**
 * フォームバリデーションエラーを処理
 */
export function handleValidationErrors(errors: Array<{ field: string; message: string; code?: string }>): AppErrorHandler {
  const handler = new AppErrorHandler();
  
  errors.forEach(error => {
    handler.setFieldError(error.field, error.message, error.code);
  });

  return handler;
}

/**
 * API route用のエラーハンドラー
 */
export function handleRouteError(error: unknown) {
  const { NextResponse } = require('next/server');
  
  console.error('API route error:', error);
  
  if (error instanceof Error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
  
  return NextResponse.json(
    { success: false, error: 'Internal server error' },
    { status: 500 }
  );
}
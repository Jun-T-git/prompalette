/**
 * CORS設定管理
 * 環境変数から許可するオリジンを取得し、開発環境と本番環境で適切な設定を提供
 */

export interface CorsConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
}

/**
 * 環境に応じたCORS設定を取得
 */
export function getCorsConfig(): CorsConfig {
  // 環境変数から許可するオリジンを取得
  const envOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',').map(origin => origin.trim()) || [];
  
  // 開発環境のデフォルトオリジン
  const developmentOrigins = process.env.NODE_ENV === 'development' 
    ? ['http://localhost:3000', 'http://localhost:5173'] 
    : [];
  
  // 本番環境では環境変数が必須
  const productionOrigins = process.env.NODE_ENV === 'production' && envOrigins.length === 0
    ? ['https://prompalette.com'] // フォールバック用（警告ログ出力）
    : [];
  
  const allowedOrigins = [...envOrigins, ...developmentOrigins, ...productionOrigins];
  
  // 本番環境で環境変数が未設定の場合は警告（logWarnを使用予定だが、循環参照回避のためconsole.warnを使用）
  if (process.env.NODE_ENV === 'production' && envOrigins.length === 0) {
    console.warn('⚠️  CORS_ALLOWED_ORIGINS environment variable is not set in production. Using fallback origins.');
  }
  
  return {
    allowedOrigins,
    allowedMethods: ['GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  };
}

/**
 * 指定されたオリジンが許可されているかチェック
 */
export function isOriginAllowed(origin: string | null, config: CorsConfig): boolean {
  if (!origin) return false;
  return config.allowedOrigins.includes(origin);
}

/**
 * CORSヘッダーを生成
 */
export function createCorsHeaders(origin?: string | null): Record<string, string> {
  const config = getCorsConfig();
  
  // Production: Strict origin checking
  if (process.env.NODE_ENV === 'production') {
    const allowedOrigin = origin && isOriginAllowed(origin, config) ? origin : null;
    if (!allowedOrigin) {
      throw new Error(`CORS: Origin ${origin} not allowed in production`);
    }
    
    return {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': config.allowedMethods.join(', '),
      'Access-Control-Allow-Headers': config.allowedHeaders.join(', '),
    };
  }
  
  // Development: Allow origin if valid, fallback to localhost
  const allowedOrigin = origin && isOriginAllowed(origin, config) 
    ? origin 
    : config.allowedOrigins[0] || 'http://localhost:3000';
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': config.allowedMethods.join(', '),
    'Access-Control-Allow-Headers': config.allowedHeaders.join(', '),
  };
}
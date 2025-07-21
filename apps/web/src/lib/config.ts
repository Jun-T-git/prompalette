/**
 * アプリケーション設定管理
 * 依存性注入パターンによりテスト可能な設計
 */

export interface AppConfig {
  environment: 'development' | 'staging' | 'production' | 'test';
  isLocalDevelopment: boolean;
  supabase: {
    url: string | null;
    anonKey: string | null;
    serviceRoleKey: string | null;
    enabled: boolean;
  };
  auth: {
    secret: string | null;
    providers: {
      github: {
        clientId: string | null;
        clientSecret: string | null;
      };
    };
  };
}

/**
 * 環境変数からアプリケーション設定を生成
 */
export function createAppConfig(): AppConfig {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || null;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || null;
  
  // Use the same logic as env-config for local development detection
  // If using local Supabase with URL configured, we want to use Supabase, not stubs
  const isLocalDevelopment = nodeEnv === 'development' && !supabaseUrl && !supabaseAnonKey;
  
  return {
    environment: nodeEnv as AppConfig['environment'],
    isLocalDevelopment,
    supabase: {
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
      serviceRoleKey: supabaseServiceRoleKey,
      enabled: !!(supabaseUrl && supabaseAnonKey),
    },
    auth: {
      secret: process.env.NEXTAUTH_SECRET || null,
      providers: {
        github: {
          clientId: process.env.GITHUB_CLIENT_ID || null,
          clientSecret: process.env.GITHUB_CLIENT_SECRET || null,
        },
      },
    },
  };
}

/**
 * デフォルト設定インスタンス
 */
export const appConfig: AppConfig = createAppConfig();

/**
 * 設定検証
 */
export function validateConfig(config: AppConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 本番環境でのSupabase設定チェック
  if (config.environment === 'production') {
    if (!config.supabase.enabled) {
      errors.push('Supabase configuration is required in production');
    }
    if (!config.auth.secret) {
      errors.push('NEXTAUTH_SECRET is required in production');
    }
  }

  // Supabase使用時の設定チェック
  if (config.supabase.enabled) {
    if (!config.supabase.url) {
      errors.push('NEXT_PUBLIC_SUPABASE_URL is required when using Supabase');
    }
    if (!config.supabase.anonKey) {
      errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required when using Supabase');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 環境別設定チェック
 */
export function getEnvironmentInfo(): {
  environment: string;
  isLocalDevelopment: boolean;
  supabaseEnabled: boolean;
  configValid: boolean;
  errors: string[];
} {
  const config = appConfig;
  const validation = validateConfig(config);
  
  return {
    environment: config.environment,
    isLocalDevelopment: config.isLocalDevelopment,
    supabaseEnabled: config.supabase.enabled,
    configValid: validation.valid,
    errors: validation.errors,
  };
}
/**
 * 環境検出ユーティリティ
 * アプリケーションが実行されている環境を判定
 */

/**
 * E2Eテスト環境かどうかを判定
 * @returns E2Eテスト環境の場合true
 */
export function isE2ETestEnvironment(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Check for E2E test indicators
  const isPlaywrightTest = 'navigator' in window && 'webdriver' in (window.navigator as unknown as { webdriver?: boolean });
  const isTestPort = window.location.port === '1420';
  const isLocalhost = window.location.hostname === 'localhost';
  
  return isPlaywrightTest || (isLocalhost && isTestPort);
}

/**
 * Tauri環境かどうかを判定
 * @returns Tauri環境の場合true
 */
export function isTauriEnvironment(): boolean {
  // E2Eテスト環境では常にtrueを返す
  if (isE2ETestEnvironment()) {
    return true;
  }
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

/**
 * 開発環境かどうかを判定
 * @returns 開発環境の場合true
 */
export function isDevelopmentEnvironment(): boolean {
  return process.env.NODE_ENV === 'development'
}

/**
 * 本番環境かどうかを判定
 * @returns 本番環境の場合true
 */
export function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * テスト環境かどうかを判定
 * @returns テスト環境の場合true
 */
export function isTestEnvironment(): boolean {
  return process.env.NODE_ENV === 'test'
}

/**
 * ブラウザ環境かどうかを判定
 * @returns ブラウザ環境の場合true
 */
export function isBrowserEnvironment(): boolean {
  return typeof window !== 'undefined' && !isTauriEnvironment()
}

/**
 * 環境情報を取得
 * @returns 環境情報オブジェクト
 */
export function getEnvironmentInfo() {
  return {
    isTauri: isTauriEnvironment(),
    isDevelopment: isDevelopmentEnvironment(),
    isProduction: isProductionEnvironment(),
    isTest: isTestEnvironment(),
    isBrowser: isBrowserEnvironment(),
    nodeEnv: process.env.NODE_ENV,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
  }
}
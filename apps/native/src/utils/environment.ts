/**
 * 環境検出ユーティリティ
 * アプリケーションが実行されている環境を判定
 */

/**
 * Tauri環境かどうかを判定
 * @returns Tauri環境の場合true
 */
export function isTauriEnvironment(): boolean {
  // E2Eテスト環境では常にtrueを返す
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost' && window.location.port === '1420') {
    return true
  }
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
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
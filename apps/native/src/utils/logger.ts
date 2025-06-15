/**
 * ログレベルの種類を定義
 * debug < info < warn < error の順で優先度が上がる
 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

/**
 * ログレベルの優先度マッピング
 * 数値が大きいほど高優先度
 */
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

/**
 * 文字列が有効なログレベルかどうかをチェック
 * @param level - チェックする文字列
 * @returns 有効なログレベルであるかどうか
 */
function isValidLogLevel(level: string): level is LogLevel {
  return ['debug', 'info', 'warn', 'error'].includes(level)
}

/**
 * Loggerクラスの設定オプション
 * テスト時のモックや環境固有の設定で使用
 */
interface LoggerConfig {
  /** ログレベルの上書き設定 */
  logLevel?: LogLevel | string
  /** Node.js環境の上書き設定 */
  nodeEnv?: string
}

/**
 * 構造化ログ出力クラス
 * 環境別のログレベル制御とフォーマット統一を提供
 * 
 * @example
 * ```typescript
 * import { logger } from './logger'
 * 
 * logger.debug('デバッグ情報', { userId: 123 })
 * logger.info('ユーザーログイン成功')
 * logger.warn('非推奨のAPI使用')
 * logger.error('エラー発生', error)
 * ```
 */
class Logger {
  private config: LoggerConfig

  /**
   * Loggerインスタンスを作成
   * @param config - ロガーの設定オプション
   */
  constructor(config: LoggerConfig = {}) {
    this.config = config
  }

  /**
   * 現在のログレベルを取得
   * 優先度: config > VITE_LOG_LEVEL > 'info'
   * @returns 現在のログレベル
   */
  private getLogLevel(): LogLevel {
    const level = this.config.logLevel || import.meta.env.VITE_LOG_LEVEL || 'info'
    return isValidLogLevel(level) ? level : 'info'
  }

  /**
   * 現在の実行環境を取得
   * 優先度: config > VITE_NODE_ENV > 'production'
   * @returns 実行環境
   */
  private getNodeEnv(): string {
    return this.config.nodeEnv || import.meta.env.VITE_NODE_ENV || 'production'
  }

  /**
   * 指定されたレベルのログを出力すべきか判定
   * 本番環境ではエラーのみ、開発環境ではレベルフィルタリングあり
   * @param level - チェックするログレベル
   * @returns ログ出力すべきかどうか
   */
  private shouldLog(level: LogLevel): boolean {
    const nodeEnv = this.getNodeEnv()
    // 本番環境ではエラーのみログ出力
    if (nodeEnv === 'production') {
      return level === 'error'
    }
    // 開発環境ではレベルフィルタリングあり
    const currentLogLevel = this.getLogLevel()
    return LOG_LEVELS[level] >= LOG_LEVELS[currentLogLevel]
  }

  /**
   * デバッグレベルのログを出力
   * 開発時の詳細なデバッグ情報用
   * @param message - ログメッセージ
   * @param args - 追加のログデータ
   */
  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug(`[DEBUG] ${message}`, ...args)
    }
  }

  /**
   * 情報レベルのログを出力
   * 一般的な情報や状態報告用
   * @param message - ログメッセージ
   * @param args - 追加のログデータ
   */
  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(`[INFO] ${message}`, ...args)
    }
  }

  /**
   * 警告レベルのログを出力
   * 潜在的な問題や非推奨操作用
   * @param message - ログメッセージ
   * @param args - 追加のログデータ
   */
  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, ...args)
    }
  }

  /**
   * エラーレベルのログを出力
   * アプリケーションエラーや例外用
   * @param message - ログメッセージ
   * @param args - 追加のログデータ（エラーオブジェクトなど）
   */
  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(`[ERROR] ${message}`, ...args)
    }
  }
}

/**
 * アプリケーション全体で使用するグローバルロガーインスタンス
 * 環境変数に基づいて自動設定される
 */
export const logger = new Logger()

/**
 * Loggerクラスのエクスポート
 * テスト時のモックや独自設定のインスタンス作成用
 */
export { Logger }
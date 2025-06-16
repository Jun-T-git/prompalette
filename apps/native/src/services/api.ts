import type { Prompt, CreatePromptRequest, UpdatePromptRequest, SearchQuery } from '../types'
import { logger, isTauriEnvironment } from '../utils'

/**
 * Tauri invoke関数を安全に取得
 */
async function getTauriInvoke() {
  if (!isTauriEnvironment()) {
    return null
  }
  
  try {
    const { invoke } = await import('@tauri-apps/api/core')
    return invoke
  } catch (error) {
    logger.error('Failed to import Tauri API:', error)
    return null
  }
}

/**
 * Tauriコマンドのレスポンス型
 */
interface TauriResponse<T> {
  success: boolean
  data: T
}

/**
 * Tauriエラーレスポンス型
 */
interface TauriError {
  error: string
}

/**
 * APIリクエストエラークラス
 * Tauriコマンドエラーメッセージを保持
 */
class ApiError extends Error {
  /**
   * ApiErrorインスタンスを作成
   * @param message - エラーメッセージ
   */
  constructor(message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Tauriコマンド実行のラッパー関数
 * 統一されたエラーハンドリングとレスポンス処理を提供
 * 
 * @template T - レスポンスデータの型
 * @param command - Tauriコマンド名
 * @param args - コマンド引数
 * @returns コマンド実行結果
 * @throws {ApiError} コマンド実行エラー時
 */
async function invokeCommand<T>(
  command: string,
  args?: Record<string, unknown>
): Promise<T> {
  // Tauri環境でない場合は適切なエラーメッセージを表示
  if (!isTauriEnvironment()) {
    const errorMessage = 'Tauri environment not available. Please run "pnpm dev" instead of "pnpm dev:web"'
    logger.error(`Tauri command "${command}" failed:`, { error: errorMessage, args })
    throw new ApiError(errorMessage)
  }

  // Tauri invoke関数を取得
  const invoke = await getTauriInvoke()
  if (!invoke) {
    const errorMessage = 'Failed to load Tauri API'
    logger.error(`Tauri command "${command}" failed:`, { error: errorMessage, args })
    throw new ApiError(errorMessage)
  }

  try {
    const response = await invoke<TauriResponse<T>>(command, args)
    
    if (!response.success) {
      throw new Error('Command execution failed')
    }
    
    return response.data
  } catch (error) {
    let errorMessage = 'Unknown error occurred'
    
    if (typeof error === 'string') {
      errorMessage = error
    } else if (error instanceof Error) {
      errorMessage = error.message
    } else if (typeof error === 'object' && error !== null && 'error' in error) {
      errorMessage = (error as TauriError).error
    }
    
    logger.error(`Tauri command "${command}" failed:`, { error: errorMessage, args })
    throw new ApiError(errorMessage)
  }
}

/**
 * プロンプト関連のAPI呼び出し関数群
 * CRUD操作と検索機能を提供
 * 
 * @example
 * ```typescript
 * // 全プロンプト取得
 * const prompts = await promptsApi.getAll()
 * 
 * // 新規作成
 * const newPrompt = await promptsApi.create({
 *   title: 'タイトル',
 *   content: '内容'
 * })
 * ```
 */
export const promptsApi = {
  /**
   * 全てのプロンプトを取得
   * @returns プロンプトの配列
   */
  async getAll(): Promise<Prompt[]> {
    return invokeCommand<Prompt[]>('get_all_prompts')
  },

  /**
   * 指定したIDのプロンプトを取得
   * @param id - プロンプトID
   * @returns 指定したプロンプト
   * @throws {ApiError} プロンプトが見つからない場合
   */
  async getById(id: string): Promise<Prompt | null> {
    return invokeCommand<Prompt | null>('get_prompt', { id })
  },

  /**
   * 新しいプロンプトを作成
   * @param request - 作成リクエストデータ
   * @returns 作成されたプロンプト（ID付き）
   * @throws {ApiError} 作成失敗時
   */
  async create(request: CreatePromptRequest): Promise<Prompt> {
    return invokeCommand<Prompt>('create_prompt', { request })
  },

  /**
   * 既存のプロンプトを更新
   * @param request - 更新リクエストデータ（ID含む）
   * @returns 更新されたプロンプト
   * @throws {ApiError} 更新失敗時またはプロンプトが見つからない場合
   */
  async update(request: UpdatePromptRequest): Promise<Prompt | null> {
    return invokeCommand<Prompt | null>('update_prompt', { 
      id: request.id, 
      request: {
        title: request.title,
        content: request.content,
        category: request.category,
        tags: request.tags
      }
    })
  },

  /**
   * 指定したプロンプトを削除
   * @param id - 削除するプロンプトのID
   * @returns 削除成功の可否
   * @throws {ApiError} 削除失敗時またはプロンプトが見つからない場合
   */
  async delete(id: string): Promise<boolean> {
    return invokeCommand<boolean>('delete_prompt', { id })
  },

  /**
   * 条件を指定してプロンプトを検索
   * 
   * @param query - 検索条件
   * @returns 検索結果（プロンプト配列）
   * 
   * @example
   * ```typescript
   * // キーワード検索
   * const prompts = await promptsApi.search({ q: 'ChatGPT' })
   * 
   * // カテゴリ検索
   * const prompts = await promptsApi.search({ q: '開発支援' })
   * ```
   */
  async search(query: SearchQuery): Promise<Prompt[]> {
    const searchQuery = query.q || ''
    return invokeCommand<Prompt[]>('search_prompts', { query: searchQuery })
  },
}

/**
 * アプリケーション情報とヘルスチェック関連API
 * Native Appの状態確認用
 */
export const healthApi = {
  /**
   * アプリケーション情報を取得
   * @returns アプリの名前、バージョン、説明
   * @throws {ApiError} アプリ情報取得失敗時
   */
  async getAppInfo(): Promise<{ name: string; version: string; description: string }> {
    return invokeCommand('get_app_info')
  },

  /**
   * データベース初期化を実行
   * @returns 初期化成功メッセージ
   * @throws {ApiError} データベース初期化失敗時
   */
  async initDatabase(): Promise<string> {
    return invokeCommand('init_database')
  },
}
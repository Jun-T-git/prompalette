import { invoke } from '@tauri-apps/api/core'

import type { 
  Prompt, 
  CreatePromptRequest, 
  UpdatePromptRequest, 
  SearchQuery,
  PinnedPrompt,
  PinPromptRequest,
  UnpinPromptRequest,
  CopyPinnedPromptRequest
} from '../types'
import { logger, isTauriEnvironment } from '../utils'

import { mockPromptsApi, mockPinnedPromptsApi, mockHealthApi } from './mockApi'

/**
 * E2Eテスト環境かどうかを判定
 */
function isE2ETestEnvironment(): boolean {
  return typeof window !== 'undefined' && 
         window.location.hostname === 'localhost' && 
         window.location.port === '1420' &&
         !('__TAURI_INTERNALS__' in window)
}

/**
 * Tauri invoke関数を安全に取得
 */
function getTauriInvoke() {
  if (!isTauriEnvironment()) {
    return null
  }
  
  return invoke
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
 * @param signal - AbortSignal for request cancellation
 * @returns コマンド実行結果
 * @throws {ApiError} コマンド実行エラー時
 */
async function invokeCommand<T>(
  command: string,
  args?: Record<string, unknown>,
  signal?: AbortSignal
): Promise<T> {
  // Tauri環境でない場合は適切なエラーメッセージを表示
  if (!isTauriEnvironment()) {
    const errorMessage = 'Tauri environment not available. Please run "pnpm dev" instead of "pnpm dev:web"'
    logger.error(`Tauri command "${command}" failed:`, { error: errorMessage, args })
    throw new ApiError(errorMessage)
  }

  // Tauri invoke関数を取得
  const invoke = getTauriInvoke()
  if (!invoke) {
    const errorMessage = 'Failed to load Tauri API'
    logger.error(`Tauri command "${command}" failed:`, { error: errorMessage, args })
    throw new ApiError(errorMessage)
  }

  try {
    // Check for cancellation before making the request
    if (signal?.aborted) {
      throw new Error('Request was cancelled')
    }

    const response = await invoke<TauriResponse<T>>(command, args)
    
    // Check for cancellation after the request
    if (signal?.aborted) {
      throw new Error('Request was cancelled')
    }
    
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
 * データベースから取得される生のPromptデータ型
 */
interface RawPrompt {
  id: string;
  title: string;
  content: string;
  tags?: string | string[]; // JSON文字列または配列
  quick_access_key?: string; // クイックアクセスキー
  created_at: string;
  updated_at: string;
}

/**
 * データベースからのPromptデータをフロントエンド用に変換
 * JSON文字列として保存されたtagsを配列に変換
 */
function transformPromptFromDatabase(rawPrompt: RawPrompt): Prompt {
  let tags: string[] = [];
  
  if (rawPrompt.tags) {
    if (Array.isArray(rawPrompt.tags)) {
      tags = rawPrompt.tags;
    } else if (typeof rawPrompt.tags === 'string') {
      try {
        const parsed = JSON.parse(rawPrompt.tags);
        tags = Array.isArray(parsed) ? parsed : [];
      } catch {
        // JSON parse failed, treat as single tag
        tags = [rawPrompt.tags];
      }
    }
  }
  
  return {
    ...rawPrompt,
    tags: tags.length > 0 ? tags : undefined,
    quickAccessKey: rawPrompt.quick_access_key,
  };
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
   * @param signal - AbortSignal for request cancellation
   * @returns プロンプトの配列
   */
  async getAll(signal?: AbortSignal): Promise<Prompt[]> {
    if (isE2ETestEnvironment()) {
      return mockPromptsApi.getAll()
    }
    const rawPrompts = await invokeCommand<RawPrompt[]>('get_all_prompts', undefined, signal)
    return rawPrompts.map(transformPromptFromDatabase)
  },

  /**
   * 指定したIDのプロンプトを取得
   * @param id - プロンプトID
   * @returns 指定したプロンプト
   * @throws {ApiError} プロンプトが見つからない場合
   */
  async getById(id: string): Promise<Prompt | null> {
    if (isE2ETestEnvironment()) {
      return mockPromptsApi.getById(id)
    }
    const rawPrompt = await invokeCommand<RawPrompt | null>('get_prompt', { id })
    return rawPrompt ? transformPromptFromDatabase(rawPrompt) : null
  },

  /**
   * 新しいプロンプトを作成
   * @param request - 作成リクエストデータ
   * @returns 作成されたプロンプト（ID付き）
   * @throws {ApiError} 作成失敗時
   */
  async create(request: CreatePromptRequest): Promise<Prompt> {
    if (isE2ETestEnvironment()) {
      return mockPromptsApi.create(request)
    }
    const rawPrompt = await invokeCommand<RawPrompt>('create_prompt', { request })
    return transformPromptFromDatabase(rawPrompt)
  },

  /**
   * 既存のプロンプトを更新
   * @param request - 更新リクエストデータ（ID含む）
   * @returns 更新されたプロンプト
   * @throws {ApiError} 更新失敗時またはプロンプトが見つからない場合
   */
  async update(request: UpdatePromptRequest): Promise<Prompt | null> {
    if (isE2ETestEnvironment()) {
      return mockPromptsApi.update(request)
    }
    const rawPrompt = await invokeCommand<RawPrompt | null>('update_prompt', { 
      id: request.id, 
      request: {
        title: request.title,
        content: request.content,
        tags: request.tags,
        quickAccessKey: request.quickAccessKey
      }
    })
    return rawPrompt ? transformPromptFromDatabase(rawPrompt) : null
  },

  /**
   * 指定したプロンプトを削除
   * @param id - 削除するプロンプトのID
   * @returns 削除成功の可否
   * @throws {ApiError} 削除失敗時またはプロンプトが見つからない場合
   */
  async delete(id: string): Promise<boolean> {
    if (isE2ETestEnvironment()) {
      return mockPromptsApi.delete(id)
    }
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
    if (isE2ETestEnvironment()) {
      return mockPromptsApi.search(query)
    }
    const searchQuery = query.q || ''
    const rawPrompts = await invokeCommand<RawPrompt[]>('search_prompts', { query: searchQuery })
    return rawPrompts.map(transformPromptFromDatabase)
  },
}

/**
 * ピン留めプロンプト関連のAPI呼び出し関数群
 * ピン留め、解除、取得、コピー機能を提供
 * 
 * @example
 * ```typescript
 * // プロンプトをピン留め
 * await pinnedPromptsApi.pin({ prompt_id: 'abc123', position: 1 })
 * 
 * // ピン留め解除
 * await pinnedPromptsApi.unpin({ position: 1 })
 * 
 * // ピン留めプロンプト一覧取得
 * const pinned = await pinnedPromptsApi.getAll()
 * ```
 */
export const pinnedPromptsApi = {
  /**
   * プロンプトを指定位置にピン留めする
   * @param request - ピン留めリクエストデータ
   * @returns 成功メッセージ
   * @throws {ApiError} ピン留め失敗時
   */
  async pin(request: PinPromptRequest): Promise<string> {
    if (isE2ETestEnvironment()) {
      return mockPinnedPromptsApi.pin(request)
    }
    return invokeCommand<string>('pin_prompt', { 
      promptId: request.prompt_id, 
      position: request.position 
    })
  },

  /**
   * 指定位置のピン留めを解除する
   * @param request - ピン留め解除リクエストデータ
   * @returns 成功メッセージ
   * @throws {ApiError} ピン留め解除失敗時
   */
  async unpin(request: UnpinPromptRequest): Promise<string> {
    if (isE2ETestEnvironment()) {
      return mockPinnedPromptsApi.unpin(request)
    }
    return invokeCommand<string>('unpin_prompt', { position: request.position })
  },

  /**
   * ピン留めされた全プロンプトを取得
   * @param signal - AbortSignal for request cancellation
   * @returns ピン留めプロンプトの配列（位置順にソート済み）
   * @throws {ApiError} 取得失敗時
   */
  async getAll(signal?: AbortSignal): Promise<PinnedPrompt[]> {
    if (isE2ETestEnvironment()) {
      return mockPinnedPromptsApi.getAll()
    }
    const prompts = await invokeCommand<Prompt[]>('get_pinned_prompts', undefined, signal)
    
    // デバッグ: バックエンドから返される生データを確認
    console.log('Raw pinned prompts from backend:', prompts)
    prompts.forEach((prompt, index) => {
      console.log(`Prompt ${index}:`, {
        id: prompt.id,
        title: prompt.title,
        pinned_position: prompt.pinned_position,
        pinned_at: prompt.pinned_at
      })
    })
    
    // Promptの配列をPinnedPromptの配列に変換
    // バックエンドから実際のposition情報を使用
    const result = prompts
      .filter(prompt => prompt.pinned_position != null) // pinned_positionがnullでないもののみ
      .map((prompt) => ({
        ...prompt,
        position: prompt.pinned_position!, // 確実にnumberである
        pinned_at: prompt.pinned_at || new Date().toISOString() // バックエンドのpinned_atフィールドを使用
      }))
    
    console.log('Filtered and mapped pinned prompts:', result)
    return result
  },

  /**
   * 指定位置のピン留めプロンプトをクリップボードにコピー
   * @param request - コピーリクエストデータ
   * @returns 成功メッセージ
   * @throws {ApiError} コピー失敗時
   */
  async copyToClipboard(request: CopyPinnedPromptRequest): Promise<string> {
    if (isE2ETestEnvironment()) {
      return mockPinnedPromptsApi.copyToClipboard(request)
    }
    return invokeCommand<string>('copy_pinned_prompt', { position: request.position })
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
    if (isE2ETestEnvironment()) {
      return mockHealthApi.getAppInfo()
    }
    return invokeCommand('get_app_info')
  },

  /**
   * データベース初期化を実行
   * @returns 初期化成功メッセージ
   * @throws {ApiError} データベース初期化失敗時
   */
  async initDatabase(): Promise<string> {
    if (isE2ETestEnvironment()) {
      return mockHealthApi.initDatabase()
    }
    return invokeCommand('init_database')
  },
}
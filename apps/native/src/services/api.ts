import type { Prompt, CreatePromptRequest, UpdatePromptRequest, SearchQuery, SearchResult } from '../types'
import { logger } from '../utils'

/**
 * APIベースURLの設定
 * 環境変数から取得、未設定時はローカル開発サーバーを使用
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

/**
 * APIアクセスキーの取得
 * 環境変数から取得、未設定時はエラー
 */
const API_KEY = import.meta.env.VITE_API_KEY

// APIキーの存在チェック（アプリ起動時に実行）
if (!API_KEY) {
  throw new Error('VITE_API_KEY environment variable is required')
}

/**
 * APIリクエストエラークラス
 * HTTPステータスコードとメッセージを保持
 */
class ApiError extends Error {
  /**
   * ApiErrorインスタンスを作成
   * @param status - HTTPステータスコード
   * @param message - エラーメッセージ
   */
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * 共通のAPIリクエスト処理
 * 認証ヘッダーの付与、エラーハンドリング、レスポンスのJSONパースを実施
 * 
 * @template T - レスポンスデータの型
 * @param endpoint - APIエンドポイント（パス部分）
 * @param options - fetch APIのオプション
 * @returns パースされたJSONレスポンス
 * @throws {ApiError} HTTPエラー時にスロー
 * 
 * @example
 * ```typescript
 * const prompts = await apiRequest<Prompt[]>('/api/prompts')
 * ```
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  // リクエストの実行（認証ヘッダーを自動付与）
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      ...options.headers,
    },
  })

  // HTTPエラーのハンドリング
  if (!response.ok) {
    const error = new ApiError(response.status, `API Error: ${response.statusText}`)
    logger.error('API request failed:', { url, status: response.status, statusText: response.statusText })
    throw error
  }

  return response.json()
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
    return apiRequest<Prompt[]>('/api/prompts')
  },

  /**
   * 指定したIDのプロンプトを取得
   * @param id - プロンプトID
   * @returns 指定したプロンプト
   * @throws {ApiError} プロンプトが見つからない場合
   */
  async getById(id: string): Promise<Prompt> {
    return apiRequest<Prompt>(`/api/prompts/${id}`)
  },

  /**
   * 新しいプロンプトを作成
   * @param request - 作成リクエストデータ
   * @returns 作成されたプロンプト（ID付き）
   * @throws {ApiError} 作成失敗時
   */
  async create(request: CreatePromptRequest): Promise<Prompt> {
    return apiRequest<Prompt>('/api/prompts', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  },

  /**
   * 既存のプロンプトを更新
   * @param request - 更新リクエストデータ（ID含む）
   * @returns 更新されたプロンプト
   * @throws {ApiError} 更新失敗時またはプロンプトが見つからない場合
   */
  async update(request: UpdatePromptRequest): Promise<Prompt> {
    return apiRequest<Prompt>(`/api/prompts/${request.id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    })
  },

  /**
   * 指定したプロンプトを削除
   * @param id - 削除するプロンプトのID
   * @returns Promise<void>
   * @throws {ApiError} 削除失敗時またはプロンプトが見つからない場合
   */
  async delete(id: string): Promise<void> {
    return apiRequest<void>(`/api/prompts/${id}`, {
      method: 'DELETE',
    })
  },

  /**
   * 条件を指定してプロンプトを検索
   * キーワード、カテゴリ、タグによる絞り込み、ページネーションに対応
   * 
   * @param query - 検索条件
   * @returns 検索結果（プロンプト配列、総数、ページ情報）
   * 
   * @example
   * ```typescript
   * // キーワード検索
   * const result = await promptsApi.search({ q: 'ChatGPT' })
   * 
   * // カテゴリとタグで絞り込み
   * const result = await promptsApi.search({
   *   category: '開発支援',
   *   tags: ['AI', 'TypeScript'],
   *   limit: 10
   * })
   * ```
   */
  async search(query: SearchQuery): Promise<SearchResult> {
    // クエリパラメータの構築
    const params = new URLSearchParams()
    if (query.q) params.append('q', query.q)
    if (query.category) params.append('category', query.category)
    if (query.tags?.length) params.append('tags', query.tags.join(','))
    if (query.limit) params.append('limit', query.limit.toString())
    if (query.offset) params.append('offset', query.offset.toString())

    // エンドポイントURLの構築
    const endpoint = params.toString() 
      ? `/api/prompts/search?${params.toString()}`
      : '/api/prompts/search'
    
    return apiRequest<SearchResult>(endpoint)
  },
}

/**
 * アプリケーションのヘルスチェック関連API
 * サーバーの状態確認用
 */
export const healthApi = {
  /**
   * アプリケーションのヘルスチェックを実行
   * @returns サーバーの状態とタイムスタンプ
   * @throws {ApiError} サーバーに接続できない場合
   */
  async check(): Promise<{ status: string; timestamp: string }> {
    return apiRequest('/health')
  },
}
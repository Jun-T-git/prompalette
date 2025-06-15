/**
 * プロンプトのデータ構造を定義
 * PromPaletteで管理される個々のプロンプトの情報を表現
 */
export interface Prompt {
  /** プロンプトの一意識別子 */
  id: string
  /** プロンプトのタイトル（最大100文字） */
  title: string
  /** プロンプトの本文内容 */
  content: string
  /** プロンプトのカテゴリ（任意） */
  category?: string
  /** プロンプトに付与されたタグの配列（任意） */
  tags?: string[]
  /** 作成日時（ISO 8601形式） */
  created_at: string
  /** 最終更新日時（ISO 8601形式） */
  updated_at: string
}

/**
 * 新規プロンプト作成時のリクエストデータ
 * APIで新しいプロンプトを作成する際に送信する情報
 */
export interface CreatePromptRequest {
  /** プロンプトのタイトル（必須、最大100文字） */
  title: string
  /** プロンプトの本文内容（必須） */
  content: string
  /** プロンプトのカテゴリ（任意） */
  category?: string
  /** プロンプトに付与するタグの配列（任意、最大10個） */
  tags?: string[]
}

/**
 * プロンプト更新時のリクエストデータ
 * 既存プロンプトの一部または全部を更新する際に使用
 */
export interface UpdatePromptRequest extends Partial<CreatePromptRequest> {
  /** 更新対象プロンプトの識別子（必須） */
  id: string
}

/**
 * プロンプト検索時のクエリパラメータ
 * 検索API呼び出し時の条件指定に使用
 */
export interface SearchQuery {
  /** 検索キーワード（タイトル・内容・タグから部分一致検索） */
  q?: string
  /** カテゴリによる絞り込み */
  category?: string
  /** タグによる絞り込み（AND条件） */
  tags?: string[]
  /** 取得件数の上限（デフォルト: 20） */
  limit?: number
  /** 検索結果のオフセット（ページネーション用） */
  offset?: number
}

/**
 * プロンプト検索結果
 * 検索APIからの応答データ構造
 */
export interface SearchResult {
  /** 検索条件に一致したプロンプトの配列 */
  prompts: Prompt[]
  /** 検索条件に一致する総件数 */
  total: number
  /** さらに結果があるかどうか（ページネーション用） */
  hasMore: boolean
}
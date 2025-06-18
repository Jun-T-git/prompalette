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
  /** プロンプトに付与されたタグの配列（用途・技術・対象などを自由に設定） */
  tags?: string[]
  /** 作成日時（ISO 8601形式） */
  created_at: string
  /** 最終更新日時（ISO 8601形式） */
  updated_at: string
  /** ピン留め位置（1-10、ピン留めされていない場合はnull） */
  pinned_position?: number | null
  /** ピン留め日時（ISO 8601形式、ピン留めされていない場合はnull） */
  pinned_at?: string | null
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
  /** プロンプトに付与するタグの配列（用途・技術・対象などを自由に設定、最大10個） */
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

/**
 * ピン留めされたプロンプトの情報
 * 位置情報と元のプロンプトデータを含む
 */
export interface PinnedPrompt extends Prompt {
  /** ピン留め位置（1-10） */
  position: number
  /** ピン留め日時（ISO 8601形式） */
  pinned_at: string
}

/**
 * ホットキー設定
 * 各ピン留めポジションに対応するキーボードショートカット
 */
export interface HotkeyConfig {
  /** ピン留め位置（1-10） */
  position: number
  /** ホットキーの組み合わせ（例: "Ctrl+1", "Cmd+Shift+1"） */
  hotkey: string
  /** ホットキーが有効かどうか */
  enabled: boolean
}

/**
 * ピン留めプロンプトの作成リクエスト
 */
export interface PinPromptRequest {
  /** ピン留めするプロンプトのID */
  prompt_id: string
  /** ピン留めする位置（1-10） */
  position: number
}

/**
 * ピン留め解除リクエスト
 */
export interface UnpinPromptRequest {
  /** 解除する位置（1-10） */
  position: number
}

/**
 * ピン留めプロンプトのコピーリクエスト
 */
export interface CopyPinnedPromptRequest {
  /** コピーする位置（1-10） */
  position: number
}
/**
 * プロンプトのデータ構造を定義
 * PromPaletteで管理される個々のプロンプトの情報を表現
 */
export interface Prompt {
  /** プロンプトの一意識別子 */
  id: string
  /** プロンプトのタイトル（最大100文字、任意） */
  title: string | null
  /** プロンプトの本文内容 */
  content: string
  /** プロンプトに付与されたタグの配列（用途・技術・対象などを自由に設定） */
  tags?: string[]
  /** クイックアクセスキー（検索で一意特定するための任意キー、英数字のみ、2-20文字） */
  quickAccessKey?: string
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
  /** プロンプトのタイトル（任意、最大100文字） */
  title: string | null | undefined
  /** プロンプトの本文内容（必須） */
  content: string
  /** プロンプトに付与するタグの配列（用途・技術・対象などを自由に設定、最大10個） */
  tags?: string[]
  /** クイックアクセスキー（検索で一意特定するための任意キー、英数字のみ、2-20文字） */
  quickAccessKey?: string
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

/**
 * アップデート情報
 */
export interface UpdateInfo {
  /** アップデートバージョン */
  version: string
  /** リリースノート */
  notes?: string
  /** 公開日時 */
  pub_date?: string
  /** ダウンロードURL */
  url: string
  /** 署名 */
  signature?: string
}

/**
 * アップデート状態
 */
export type UpdateStatus = 
  | { type: 'NoUpdateAvailable' }
  | { type: 'UpdateAvailable'; info: UpdateInfo }
  | { type: 'Downloading'; progress: number }
  | { type: 'Downloaded' }
  | { type: 'Installing' }
  | { type: 'Error'; message: string }

/**
 * データバックアップ結果
 */
export interface BackupResult {
  /** バックアップ成功可否 */
  success: boolean
  /** バックアップファイルパス */
  backup_path?: string
  /** バックアップ作成日時 */
  timestamp: string
  /** エラーメッセージ */
  error?: string
}

/**
 * バックアップ詳細情報
 */
export interface BackupInfo {
  /** ファイル名 */
  filename: string
  /** フルパス */
  full_path: string
  /** 作成日時 */
  created_at: string
  /** ファイルサイズ（バイト） */
  size_bytes: number
  /** 自動バックアップかどうか */
  is_automatic: boolean
}

/**
 * アップデート設定
 */
export interface UpdateConfig {
  /** 現在の環境 */
  environment: string
  /** アップデート機能有効可否 */
  updates_enabled: boolean
  /** 自動チェック有効可否 */
  auto_check_enabled: boolean
  /** 手動承認が必要か */
  requires_manual_approval: boolean
  /** バックアップ機能有効可否 */
  backup_enabled: boolean
  /** 公開鍵（オプション） */
  public_key?: string
}


// 統一された型定義
// データベース型とサービス型を統一

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  username: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Prompt {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string[];
  quick_access_key: string | null;
  is_public: boolean;
  view_count: number;
  copy_count: number;
  created_at: string;
  updated_at: string;
  // サービス層で追加される関連データ
  slug?: string;
  user?: User;
}

export interface PromptWithUser extends Prompt {
  user: User;
}

export interface CreatePromptInput {
  title: string;
  content: string;
  tags: string[];
  quick_access_key?: string | null;
  is_public: boolean;
}

export interface UpdatePromptInput {
  title?: string;
  content?: string;
  tags?: string[];
  quick_access_key?: string | null;
  is_public?: boolean;
}

export interface SearchOptions {
  query?: string;
  tags?: string[];
  username?: string;
  quick_access_key?: string;
  is_public?: boolean;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  prompts: Prompt[];
  total: number;
  hasMore: boolean;
}

// エラー型
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// レスポンス型
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// フィルター型
export interface PromptFilter {
  query: string;
  tags: string[];
  isPublic?: boolean;
  sortBy: 'created_at' | 'updated_at' | 'view_count' | 'copy_count';
  sortOrder: 'asc' | 'desc';
}
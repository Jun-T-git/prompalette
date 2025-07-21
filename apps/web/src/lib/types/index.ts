// Type definitions for the web app

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  avatar_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Prompt {
  id: string;
  slug: string;
  title: string;
  content: string;
  tags: string[];
  quick_access_key: string | null;
  is_public: boolean;
  user_id: string;
  user?: User;
  view_count: number;
  copy_count: number;
  created_at: string;
  updated_at: string;
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

export interface SearchResult {
  prompts: Prompt[];
  total: number;
  hasMore: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
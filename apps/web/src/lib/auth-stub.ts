// ローカル開発用の認証スタブ
import type { Session } from 'next-auth';
import { appConfig, type AppConfig } from './config';

export const STUB_USER_SESSION: Session = {
  user: {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'stub@example.com',
    name: 'スタブユーザー',
    image: 'https://github.com/github.png',
    username: 'stub-user',
    isPublic: true,
  },
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30日後
};

export const STUB_PROMPTS = [
  {
    id: 'prompt-1',
    user_id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'コードレビュー用プロンプト',
    content: 'このコードをレビューして、改善点を教えてください。特に以下の点を重視してください：\n\n1. 可読性\n2. パフォーマンス\n3. セキュリティ\n4. ベストプラクティス',
    tags: ['コードレビュー', 'プログラミング', '品質管理'],
    quick_access_key: 'review' as string | null,
    is_public: true,
    view_count: 42,
    copy_count: 15,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prompt-2',
    user_id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'ドキュメント作成支援',
    content: '以下の機能についてのドキュメントを作成してください：\n\n- 機能概要\n- 使用方法\n- 注意事項\n- サンプルコード',
    tags: ['ドキュメント', 'テクニカルライティング'],
    quick_access_key: 'docs' as string | null,
    is_public: true,
    view_count: 28,
    copy_count: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prompt-3',
    user_id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'バグ分析プロンプト',
    content: 'このエラーメッセージやログを分析して、以下を教えてください：\n\n1. 問題の原因\n2. 修正方法\n3. 予防策\n4. 関連するベストプラクティス',
    tags: ['デバッグ', 'エラー分析', 'トラブルシューティング'],
    quick_access_key: 'debug' as string | null,
    is_public: false,
    view_count: 5,
    copy_count: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prompt-4',
    user_id: 'other-user-456',
    title: 'UI/UX改善提案',
    content: 'このUI/UXデザインを評価して、改善提案をお願いします：\n\n- ユーザビリティ\n- アクセシビリティ\n- 視覚的デザイン\n- ユーザー体験',
    tags: ['UI/UX', 'デザイン', 'ユーザビリティ'],
    quick_access_key: 'ux' as string | null,
    is_public: true,
    view_count: 73,
    copy_count: 22,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prompt-5',
    user_id: 'other-user-456',
    title: '翻訳・多言語対応',
    content: '以下のテキストを自然な日本語に翻訳してください。技術的な内容については、適切な専門用語を使用してください。',
    tags: ['翻訳', '多言語', '国際化'],
    quick_access_key: 'translate' as string | null,
    is_public: true,
    view_count: 31,
    copy_count: 12,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const STUB_USERS = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'stub@example.com',
    name: 'スタブユーザー',
    avatar_url: 'https://github.com/github.png',
    username: 'stub-user',
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    email: 'other@example.com',
    name: '他のユーザー',
    avatar_url: 'https://github.com/octocat.png',
    username: 'other-user',
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// 開発環境判定
// 設定に基づくローカル開発環境の判定
export const isLocalDevelopment = appConfig.isLocalDevelopment;

/**
 * 設定可能な認証サービス
 */
export interface AuthService {
  isLocalDevelopment: boolean;
  getCurrentSession(): Session | null;
  getPromptStorage(): typeof stubPromptStorage;
}

/**
 * 認証サービスの実装
 */
export function createAuthService(config: AppConfig): AuthService {
  return {
    isLocalDevelopment: config.isLocalDevelopment,
    getCurrentSession() {
      return config.isLocalDevelopment ? STUB_USER_SESSION : null;
    },
    getPromptStorage() {
      return stubPromptStorage;
    },
  };
}

// デフォルトの認証サービス
export const authService = createAuthService(appConfig);

// Development mode configuration
// NODE_ENV: process.env.NODE_ENV
// NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT_SET'
// isLocalDevelopment: configured based on environment

// スタブデータ操作用のユーティリティ関数
export const stubPromptStorage = {
  data: [...STUB_PROMPTS],
  
  getAll: () => stubPromptStorage.data,
  
  getById: (id: string) => stubPromptStorage.data.find(p => p.id === id),
  
  getByUserId: (userId: string) => stubPromptStorage.data.filter(p => p.user_id === userId),
  
  getPublic: () => stubPromptStorage.data.filter(p => p.is_public),
  
  create: (prompt: Omit<typeof STUB_PROMPTS[0], 'id' | 'created_at' | 'updated_at'>) => {
    const newPrompt = {
      ...prompt,
      id: `prompt-${Date.now()}`,
      view_count: prompt.view_count ?? 0,
      copy_count: prompt.copy_count ?? 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    stubPromptStorage.data.push(newPrompt);
    return newPrompt;
  },
  
  update: (id: string, updates: Partial<typeof STUB_PROMPTS[0]>) => {
    const index = stubPromptStorage.data.findIndex(p => p.id === id);
    if (index !== -1) {
      stubPromptStorage.data[index] = {
        ...stubPromptStorage.data[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      return stubPromptStorage.data[index];
    }
    return null;
  },
  
  delete: (id: string) => {
    const index = stubPromptStorage.data.findIndex(p => p.id === id);
    if (index !== -1) {
      stubPromptStorage.data.splice(index, 1);
      return true;
    }
    return false;
  },
  
  search: (query: string) => {
    return stubPromptStorage.data.filter(p => 
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.content.toLowerCase().includes(query.toLowerCase()) ||
      p.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
  },
};
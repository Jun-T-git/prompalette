/**
 * プロンプト管理サービス
 * レイヤー分離されたアーキテクチャ
 */

import { z } from 'zod';
import { Prompt, CreatePromptInput, UpdatePromptInput } from '@/lib/types';

// 拡張されたプロンプト型（サービス層用）
export interface ServicePrompt extends Prompt {
  slug: string;
}

// 後方互換性のために再エクスポート
export type { Prompt, CreatePromptInput, UpdatePromptInput };

// バリデーションスキーマ
export const createPromptSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(200, 'タイトルは200文字以内で入力してください'),
  content: z.string().min(1, 'プロンプト内容は必須です').max(100000, 'プロンプト内容は100,000文字以内で入力してください'),
  tags: z.array(z.string()).max(10, 'タグは10個まで設定できます'),
  quick_access_key: z.string().nullish(),
  is_public: z.boolean().default(false),
});

// Desktop同期用の型定義
export interface DesktopPrompt {
  desktop_id: string;
  title: string;
  content: string;
  tags: string[];
  is_public: boolean;
  quick_access_key: string | null;
  version: number;
  last_modified: string;
}

export interface SyncResult {
  uploaded: number;
  updated: number;
  conflicts: Array<{
    desktop_id: string;
    web_version: number;
    desktop_version: number;
    conflict_type: string;
  }>;
  session_id: string;
}

export interface SyncOptions {
  offset?: number;
  limit?: number;
}


// Advanced Search用の型定義
export interface AdvancedSearchCriteria {
  query: string;
  tags?: string[];
  author?: string;
  dateRange?: {
    from: string;
    to: string;
  };
  isPublic?: boolean;
  sortBy: string;
  sortOrder: string;
  limit: number;
  offset: number;
}

export interface AdvancedSearchResult {
  results: Prompt[];
  total: number;
  hasMore: boolean;
}

// プロンプトサービスインターface
export interface PromptService {
  create(userId: string, input: CreatePromptInput): Promise<Prompt>;
  getById(id: string): Promise<Prompt | null>;
  getByUserId(userId: string): Promise<Prompt[]>;
  getPublic(): Promise<Prompt[]>;
  update(id: string, userId: string, input: UpdatePromptInput): Promise<Prompt | null>;
  delete(id: string, userId: string): Promise<boolean>;
  search(query: string, userId?: string): Promise<Prompt[]>;
  getByUsernameAndSlug(username: string, slug: string): Promise<Prompt | null>;
  getByUsername(username: string, includePrivate?: boolean): Promise<Prompt[]>;
  
  // Desktop同期関連メソッド
  syncFromDesktop(userId: string, prompts: DesktopPrompt[], sessionId: string): Promise<SyncResult>;
  getAllForSync(userId: string, options?: SyncOptions): Promise<Prompt[]>;
  getUpdatedSince(userId: string, lastSync: string, options?: SyncOptions): Promise<Prompt[]>;
  
  // 詳細検索メソッド
  advancedSearch(criteria: AdvancedSearchCriteria): Promise<AdvancedSearchResult>;
}

// レポジトリインターface
export interface PromptRepository {
  create(prompt: Omit<Prompt, 'id' | 'created_at' | 'updated_at'>): Promise<Prompt>;
  findById(id: string): Promise<Prompt | null>;
  findByUserId(userId: string): Promise<Prompt[]>;
  findPublic(): Promise<Prompt[]>;
  update(id: string, updates: Partial<Prompt>): Promise<Prompt | null>;
  delete(id: string): Promise<boolean>;
  search(query: string, userId?: string): Promise<Prompt[]>;
  findByUsernameAndSlug(username: string, slug: string): Promise<Prompt | null>;
  findByUsername(username: string, includePrivate?: boolean): Promise<Prompt[]>;
}

// プロンプトサービスの実装
export class PromptServiceImpl implements PromptService {
  constructor(private repository: PromptRepository) {}

  async create(userId: string, input: CreatePromptInput): Promise<Prompt> {
    // バリデーション
    const validatedInput = createPromptSchema.parse(input);
    
    // ドメインロジック
    const prompt = {
      user_id: userId,
      title: validatedInput.title.trim(),
      content: validatedInput.content.trim(),
      tags: validatedInput.tags.map(tag => tag.trim()).filter(tag => tag.length > 0),
      quick_access_key: validatedInput.quick_access_key?.trim() || null,
      slug: '', // レポジトリ層で生成される
      is_public: validatedInput.is_public,
      view_count: 0,
      copy_count: 0,
    };

    return this.repository.create(prompt);
  }

  async getById(id: string): Promise<Prompt | null> {
    return this.repository.findById(id);
  }

  async getByUserId(userId: string): Promise<Prompt[]> {
    return this.repository.findByUserId(userId);
  }

  async getPublic(): Promise<Prompt[]> {
    return this.repository.findPublic();
  }

  async update(id: string, userId: string, input: UpdatePromptInput): Promise<Prompt | null> {
    // 権限チェック
    const existing = await this.repository.findById(id);
    if (!existing || existing.user_id !== userId) {
      throw new Error('プロンプトが見つからないか、編集権限がありません');
    }

    // バリデーション
    const updates: Partial<Prompt> = {};
    if (input.title !== undefined) {
      updates.title = input.title.trim();
    }
    if (input.content !== undefined) {
      updates.content = input.content.trim();
    }
    if (input.tags !== undefined) {
      updates.tags = input.tags.map(tag => tag.trim()).filter(tag => tag.length > 0);
    }
    if (input.quick_access_key !== undefined) {
      updates.quick_access_key = input.quick_access_key?.trim() || null;
    }
    if (input.is_public !== undefined) {
      updates.is_public = input.is_public;
    }

    return this.repository.update(id, updates);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    // 権限チェック
    const existing = await this.repository.findById(id);
    if (!existing || existing.user_id !== userId) {
      throw new Error('プロンプトが見つからないか、削除権限がありません');
    }

    return this.repository.delete(id);
  }

  async search(query: string, userId?: string): Promise<Prompt[]> {
    return this.repository.search(query, userId);
  }

  async getByUsernameAndSlug(username: string, slug: string): Promise<Prompt | null> {
    return this.repository.findByUsernameAndSlug(username, slug);
  }

  async getByUsername(username: string, includePrivate: boolean = false): Promise<Prompt[]> {
    return this.repository.findByUsername(username, includePrivate);
  }

  // Desktop同期関連メソッド
  async syncFromDesktop(userId: string, prompts: DesktopPrompt[], sessionId: string): Promise<SyncResult> {
    // 現在の実装では基本的な同期のみサポート
    let uploaded = 0;
    let updated = 0;
    const conflicts: Array<{
      desktop_id: string;
      web_version: number;
      desktop_version: number;
      conflict_type: string;
    }> = [];

    for (const desktopPrompt of prompts) {
      try {
        // Desktop IDによる既存プロンプトの検索（現在は未実装）
        // 新しいプロンプトとして作成
        const createInput: CreatePromptInput = {
          title: desktopPrompt.title,
          content: desktopPrompt.content,
          tags: desktopPrompt.tags,
          quick_access_key: desktopPrompt.quick_access_key,
          is_public: desktopPrompt.is_public
        };

        await this.create(userId, createInput);
        uploaded++;
      } catch (error) {
        console.error('Error syncing prompt:', desktopPrompt.desktop_id, error);
        // エラーは無視して続行
      }
    }

    return {
      uploaded,
      updated,
      conflicts,
      session_id: sessionId
    };
  }

  async getAllForSync(userId: string, options: SyncOptions = {}): Promise<Prompt[]> {
    // 現在はgetByUserIdをそのまま使用
    // 実際の実装では、desktop_idやversion情報も含める
    const prompts = await this.getByUserId(userId);
    
    // オプションによるページネーション
    if (options.offset || options.limit) {
      const offset = options.offset || 0;
      const limit = options.limit || prompts.length;
      return prompts.slice(offset, offset + limit);
    }
    
    return prompts;
  }

  async getUpdatedSince(userId: string, lastSync: string, options: SyncOptions = {}): Promise<Prompt[]> {
    // 現在は全プロンプトを返す（lastSyncは無視）
    // 実際の実装では、updated_atがlastSync以降のプロンプトのみ返す
    const prompts = await this.getByUserId(userId);
    
    // 簡易的な日付フィルタリング
    const lastSyncDate = new Date(lastSync);
    const filteredPrompts = prompts.filter(prompt => {
      const updatedAt = new Date(prompt.updated_at);
      return updatedAt > lastSyncDate;
    });
    
    // オプションによるページネーション
    if (options.offset || options.limit) {
      const offset = options.offset || 0;
      const limit = options.limit || filteredPrompts.length;
      return filteredPrompts.slice(offset, offset + limit);
    }
    
    return filteredPrompts;
  }


  async advancedSearch(criteria: AdvancedSearchCriteria): Promise<AdvancedSearchResult> {
    // 現在は基本的な実装（公開プロンプトから検索）
    // 実際の実装では、より高度なクエリ処理を行う
    let results = await this.getPublic();
    
    // クエリによるフィルタリング
    if (criteria.query) {
      const query = criteria.query.toLowerCase();
      results = results.filter(prompt => 
        prompt.title.toLowerCase().includes(query) ||
        prompt.content.toLowerCase().includes(query) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // タグによるフィルタリング
    if (criteria.tags && criteria.tags.length > 0) {
      results = results.filter(prompt =>
        criteria.tags!.some(tag => prompt.tags.includes(tag))
      );
    }

    // 作者によるフィルタリング
    if (criteria.author) {
      results = results.filter(prompt => 
        prompt.user?.username === criteria.author
      );
    }

    // 日付範囲によるフィルタリング
    if (criteria.dateRange) {
      const fromDate = new Date(criteria.dateRange.from);
      const toDate = new Date(criteria.dateRange.to);
      // toDateの終了時刻を23:59:59に設定
      toDate.setHours(23, 59, 59, 999);
      
      results = results.filter(prompt => {
        const createdAt = new Date(prompt.created_at);
        return createdAt >= fromDate && createdAt <= toDate;
      });
    }

    // 公開/非公開フィルタリング（isPublicが指定された場合）
    if (criteria.isPublic !== undefined) {
      results = results.filter(prompt => prompt.is_public === criteria.isPublic);
    }

    // ソート処理
    results.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (criteria.sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'view_count':
          aValue = a.view_count || 0;
          bValue = b.view_count || 0;
          break;
        case 'copy_count':
          aValue = a.copy_count || 0;
          bValue = b.copy_count || 0;
          break;
        case 'updated_at':
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
          break;
        case 'created_at':
        default:
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
      }

      if (criteria.sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    // ページネーション
    const total = results.length;
    const start = criteria.offset;
    const end = start + criteria.limit;
    const paginatedResults = results.slice(start, end);
    const hasMore = end < total;

    return {
      results: paginatedResults,
      total,
      hasMore
    };
  }
}

// ファクトリー関数
export function createPromptService(repository: PromptRepository): PromptService {
  return new PromptServiceImpl(repository);
}
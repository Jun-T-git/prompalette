/**
 * プロンプト管理サービス
 * レイヤー分離されたアーキテクチャ
 */

import { z } from 'zod';

// ドメインモデル
export interface Prompt {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string[];
  quick_access_key: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

// 入力データ型
export interface CreatePromptInput {
  title: string;
  content: string;
  tags: string[];
  quick_access_key: string | null;
  is_public: boolean;
}

export interface UpdatePromptInput {
  title?: string;
  content?: string;
  tags?: string[];
  quick_access_key?: string | null;
  is_public?: boolean;
}

// バリデーションスキーマ
export const createPromptSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(200, 'タイトルは200文字以内で入力してください'),
  content: z.string().min(1, 'プロンプト内容は必須です').max(100000, 'プロンプト内容は100,000文字以内で入力してください'),
  tags: z.array(z.string()).max(10, 'タグは10個まで設定できます'),
  quick_access_key: z.string().nullish(),
  is_public: z.boolean().default(false),
});

// プロンプトサービスインターface
export interface PromptService {
  create(userId: string, input: CreatePromptInput): Promise<Prompt>;
  getById(id: string): Promise<Prompt | null>;
  getByUserId(userId: string): Promise<Prompt[]>;
  getPublic(): Promise<Prompt[]>;
  update(id: string, userId: string, input: UpdatePromptInput): Promise<Prompt | null>;
  delete(id: string, userId: string): Promise<boolean>;
  search(query: string, userId?: string): Promise<Prompt[]>;
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
      is_public: validatedInput.is_public,
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
}

// ファクトリー関数
export function createPromptService(repository: PromptRepository): PromptService {
  return new PromptServiceImpl(repository);
}
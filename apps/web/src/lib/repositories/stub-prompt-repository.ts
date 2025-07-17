/**
 * スタブプロンプトレポジトリ（ローカル開発用）
 */

import { nanoid } from 'nanoid';

import type { Prompt, PromptRepository } from '@/lib/services/prompt-service';

export class StubPromptRepository implements PromptRepository {
  private prompts: Prompt[] = [
    {
      id: 'prompt-1',
      user_id: 'stub-user-123',
      title: 'コードレビュー用プロンプト',
      content: 'このコードをレビューして、改善点を教えてください。特に以下の点を重視してください：\n\n1. 可読性\n2. パフォーマンス\n3. セキュリティ\n4. ベストプラクティス',
      tags: ['コードレビュー', 'プログラミング', '品質管理'],
      quick_access_key: 'review',
      is_public: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prompt-2',
      user_id: 'stub-user-123',
      title: 'バグ修正プロンプト',
      content: '以下のエラーを修正してください。可能な限り効率的で保守性の高い解決策を提案してください。',
      tags: ['バグ修正', 'デバッグ', 'トラブルシューティング'],
      quick_access_key: 'bugfix',
      is_public: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  async create(prompt: Omit<Prompt, 'id' | 'created_at' | 'updated_at'>): Promise<Prompt> {
    const now = new Date().toISOString();
    const id = `prompt-${nanoid()}`;
    
    const newPrompt: Prompt = {
      id,
      ...prompt,
      created_at: now,
      updated_at: now,
    };

    this.prompts.push(newPrompt);
    return newPrompt;
  }

  async findById(id: string): Promise<Prompt | null> {
    return this.prompts.find(p => p.id === id) || null;
  }

  async findByUserId(userId: string): Promise<Prompt[]> {
    return this.prompts
      .filter(p => p.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async findPublic(): Promise<Prompt[]> {
    return this.prompts
      .filter(p => p.is_public)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async update(id: string, updates: Partial<Prompt>): Promise<Prompt | null> {
    const index = this.prompts.findIndex(p => p.id === id);
    if (index === -1) {
      return null;
    }

    const updated = {
      ...this.prompts[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.prompts[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.prompts.findIndex(p => p.id === id);
    if (index === -1) {
      return false;
    }

    this.prompts.splice(index, 1);
    return true;
  }

  async search(query: string, userId?: string): Promise<Prompt[]> {
    let results = this.prompts;

    // ユーザー固有の検索
    if (userId) {
      results = results.filter(p => p.user_id === userId);
    } else {
      // パブリックプロンプトのみ
      results = results.filter(p => p.is_public);
    }

    // 検索条件を適用
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(p => 
        p.title.toLowerCase().includes(lowerQuery) ||
        p.content.toLowerCase().includes(lowerQuery) ||
        p.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }

    return results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // テスト用のリセット機能
  reset(): void {
    this.prompts = [];
  }

  // テスト用のデータ取得
  getAllData(): Prompt[] {
    return [...this.prompts];
  }
}
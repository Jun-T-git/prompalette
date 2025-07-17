import { describe, it, expect, beforeEach, vi } from 'vitest';

import { PromptServiceImpl, type PromptRepository, type CreatePromptInput } from '../prompt-service';

// モックレポジトリ
class MockPromptRepository implements PromptRepository {
  private prompts: any[] = [];
  
  create = vi.fn().mockImplementation(async (prompt: any) => {
    const newPrompt = {
      id: 'test-id',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...prompt,
    };
    this.prompts.push(newPrompt);
    return newPrompt;
  });

  findById = vi.fn().mockImplementation(async (id: string) => {
    return this.prompts.find(p => p.id === id) || null;
  });

  findByUserId = vi.fn().mockImplementation(async (userId: string) => {
    return this.prompts.filter(p => p.user_id === userId);
  });

  findPublic = vi.fn().mockImplementation(async () => {
    return this.prompts.filter(p => p.is_public);
  });

  update = vi.fn().mockImplementation(async (id: string, updates: any) => {
    const index = this.prompts.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    this.prompts[index] = { ...this.prompts[index], ...updates };
    return this.prompts[index];
  });

  delete = vi.fn().mockImplementation(async (id: string) => {
    const index = this.prompts.findIndex(p => p.id === id);
    if (index === -1) return false;
    
    this.prompts.splice(index, 1);
    return true;
  });

  search = vi.fn().mockImplementation(async (query: string, userId?: string) => {
    let results = this.prompts;
    if (userId) {
      results = results.filter(p => p.user_id === userId);
    }
    return results.filter(p => 
      p.title.includes(query) || 
      p.content.includes(query) || 
      p.tags.some((tag: string) => tag.includes(query))
    );
  });

  // テスト用のヘルパー
  reset() {
    this.prompts = [];
    vi.clearAllMocks();
  }

  addPrompt(prompt: any) {
    this.prompts.push(prompt);
  }
}

describe('PromptServiceImpl', () => {
  let service: PromptServiceImpl;
  let repository: MockPromptRepository;

  beforeEach(() => {
    repository = new MockPromptRepository();
    service = new PromptServiceImpl(repository);
  });

  describe('create', () => {
    it('should create a new prompt with valid data', async () => {
      const userId = 'user-123';
      const input: CreatePromptInput = {
        title: 'Test Prompt',
        content: 'Test content',
        tags: ['tag1', 'tag2'],
        quick_access_key: 'test',
        is_public: true,
      };

      const result = await service.create(userId, input);

      expect(repository.create).toHaveBeenCalledWith({
        user_id: userId,
        title: 'Test Prompt',
        content: 'Test content',
        tags: ['tag1', 'tag2'],
        quick_access_key: 'test',
        is_public: true,
      });

      expect(result).toMatchObject({
        id: 'test-id',
        user_id: userId,
        title: 'Test Prompt',
        content: 'Test content',
        tags: ['tag1', 'tag2'],
        quick_access_key: 'test',
        is_public: true,
      });
    });

    it('should trim whitespace from title and content', async () => {
      const input: CreatePromptInput = {
        title: '  Test Prompt  ',
        content: '  Test content  ',
        tags: [],
        quick_access_key: null,
        is_public: false,
      };

      await service.create('user-123', input);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Prompt',
          content: 'Test content',
        })
      );
    });

    it('should filter out empty tags', async () => {
      const input: CreatePromptInput = {
        title: 'Test',
        content: 'Test',
        tags: ['tag1', '', '  ', 'tag2'],
        quick_access_key: null,
        is_public: false,
      };

      await service.create('user-123', input);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: ['tag1', 'tag2'],
        })
      );
    });

    it('should throw error for invalid input', async () => {
      const input = {
        title: '', // 空のタイトル
        content: 'Test content',
        tags: [],
        quick_access_key: null,
        is_public: false,
      };

      await expect(service.create('user-123', input as CreatePromptInput))
        .rejects
        .toThrow();
    });
  });

  describe('getById', () => {
    it('should return prompt by id', async () => {
      const prompt = {
        id: 'test-id',
        user_id: 'user-123',
        title: 'Test',
        content: 'Test',
        tags: [],
        quick_access_key: null,
        is_public: false,
      };

      repository.addPrompt(prompt);

      const result = await service.getById('test-id');

      expect(result).toEqual(prompt);
      expect(repository.findById).toHaveBeenCalledWith('test-id');
    });

    it('should return null for non-existent prompt', async () => {
      const result = await service.getById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getByUserId', () => {
    it('should return prompts for specific user', async () => {
      const prompts = [
        { id: '1', user_id: 'user-123', title: 'Test 1' },
        { id: '2', user_id: 'user-456', title: 'Test 2' },
        { id: '3', user_id: 'user-123', title: 'Test 3' },
      ];

      prompts.forEach(p => repository.addPrompt(p));

      const result = await service.getByUserId('user-123');

      expect(repository.findByUserId).toHaveBeenCalledWith('user-123');
      expect(result).toHaveLength(2);
    });
  });

  describe('update', () => {
    it('should update prompt when user has permission', async () => {
      const existingPrompt = {
        id: 'test-id',
        user_id: 'user-123',
        title: 'Original Title',
        content: 'Original Content',
        tags: [],
        quick_access_key: null,
        is_public: false,
      };

      repository.addPrompt(existingPrompt);

      const updates = {
        title: 'Updated Title',
        content: 'Updated Content',
      };

      const result = await service.update('test-id', 'user-123', updates);

      expect(repository.update).toHaveBeenCalledWith('test-id', updates);
      expect(result).toMatchObject(updates);
    });

    it('should throw error when user lacks permission', async () => {
      const existingPrompt = {
        id: 'test-id',
        user_id: 'user-123',
        title: 'Test',
        content: 'Test',
        tags: [],
        quick_access_key: null,
        is_public: false,
      };

      repository.addPrompt(existingPrompt);

      await expect(service.update('test-id', 'user-456', { title: 'Updated' }))
        .rejects
        .toThrow('プロンプトが見つからないか、編集権限がありません');
    });
  });

  describe('delete', () => {
    it('should delete prompt when user has permission', async () => {
      const existingPrompt = {
        id: 'test-id',
        user_id: 'user-123',
        title: 'Test',
        content: 'Test',
        tags: [],
        quick_access_key: null,
        is_public: false,
      };

      repository.addPrompt(existingPrompt);

      const result = await service.delete('test-id', 'user-123');

      expect(repository.delete).toHaveBeenCalledWith('test-id');
      expect(result).toBe(true);
    });

    it('should throw error when user lacks permission', async () => {
      const existingPrompt = {
        id: 'test-id',
        user_id: 'user-123',
        title: 'Test',
        content: 'Test',
        tags: [],
        quick_access_key: null,
        is_public: false,
      };

      repository.addPrompt(existingPrompt);

      await expect(service.delete('test-id', 'user-456'))
        .rejects
        .toThrow('プロンプトが見つからないか、削除権限がありません');
    });
  });

  describe('search', () => {
    it('should search prompts with query', async () => {
      const prompts = [
        { id: '1', title: 'JavaScript Guide', content: 'Learn JS', tags: ['js'] },
        { id: '2', title: 'Python Tutorial', content: 'Learn Python', tags: ['python'] },
      ];

      prompts.forEach(p => repository.addPrompt(p));

      const result = await service.search('JavaScript');

      expect(repository.search).toHaveBeenCalledWith('JavaScript', undefined);
      expect(result).toHaveLength(1);
    });

    it('should search user-specific prompts', async () => {
      const result = await service.search('test', 'user-123');

      expect(repository.search).toHaveBeenCalledWith('test', 'user-123');
    });
  });
});
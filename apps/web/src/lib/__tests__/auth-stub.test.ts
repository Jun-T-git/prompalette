import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  STUB_USER_SESSION,
  stubPromptStorage,
  STUB_PROMPTS,
} from '../auth-stub';

describe('Auth Stub', () => {
  describe('isLocalDevelopment', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should return true when NODE_ENV is development and NEXT_PUBLIC_SUPABASE_URL is not set', async () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true });
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      
      // Re-import to get updated value
      vi.resetModules();
      const { isLocalDevelopment } = await import('../auth-stub');
      
      expect(isLocalDevelopment).toBe(true);
    });

    it('should return false when NODE_ENV is production', async () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true });
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      
      vi.resetModules();
      const { isLocalDevelopment } = await import('../auth-stub');
      
      expect(isLocalDevelopment).toBe(false);
    });

    it('should return false when NEXT_PUBLIC_SUPABASE_URL is set', async () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true });
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      
      vi.resetModules();
      const { isLocalDevelopment } = await import('../auth-stub');
      
      expect(isLocalDevelopment).toBe(false);
    });
  });

  describe('STUB_USER_SESSION', () => {
    it('should have the correct structure', () => {
      expect(STUB_USER_SESSION).toMatchObject({
        user: {
          id: expect.any(String),
          email: expect.any(String),
          name: expect.any(String),
          image: expect.any(String),
          username: expect.any(String),
          isPublic: expect.any(Boolean),
        },
        expires: expect.any(String),
      });
    });

    it('should have expires date in the future', () => {
      const expiresDate = new Date(STUB_USER_SESSION.expires);
      const now = new Date();
      
      expect(expiresDate.getTime()).toBeGreaterThan(now.getTime());
    });
  });

  describe('stubPromptStorage', () => {
    beforeEach(() => {
      // Reset data to original state
      stubPromptStorage.data = [...STUB_PROMPTS];
    });

    describe('getAll', () => {
      it('should return all prompts', () => {
        const prompts = stubPromptStorage.getAll();
        
        expect(prompts).toHaveLength(STUB_PROMPTS.length);
        expect(prompts).toEqual(expect.arrayContaining(STUB_PROMPTS));
      });
    });

    describe('getById', () => {
      it('should return prompt by id', () => {
        const prompt = stubPromptStorage.getById('prompt-1');
        
        expect(prompt).toBeDefined();
        expect(prompt?.id).toBe('prompt-1');
        expect(prompt?.title).toBe('コードレビュー用プロンプト');
      });

      it('should return undefined for non-existent id', () => {
        const prompt = stubPromptStorage.getById('non-existent');
        
        expect(prompt).toBeUndefined();
      });
    });

    describe('getByUserId', () => {
      it('should return prompts for specific user', () => {
        const prompts = stubPromptStorage.getByUserId('550e8400-e29b-41d4-a716-446655440000');
        
        expect(prompts.length).toBeGreaterThan(0);
        expect(prompts.every(p => p.user_id === '550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      });

      it('should return empty array for non-existent user', () => {
        const prompts = stubPromptStorage.getByUserId('non-existent-user');
        
        expect(prompts).toEqual([]);
      });
    });

    describe('getPublic', () => {
      it('should return only public prompts', () => {
        const prompts = stubPromptStorage.getPublic();
        
        expect(prompts.length).toBeGreaterThan(0);
        expect(prompts.every(p => p.is_public === true)).toBe(true);
      });
    });

    describe('create', () => {
      it('should create new prompt with generated id and timestamps', () => {
        const newPromptData = {
          user_id: 'test-user',
          title: 'Test Prompt',
          content: 'Test content',
          tags: ['test'],
          quick_access_key: 'test' as string | null,
          is_public: false,
          view_count: 0,
          copy_count: 0,
        };

        const initialLength = stubPromptStorage.data.length;
        const newPrompt = stubPromptStorage.create(newPromptData);

        expect(newPrompt).toMatchObject({
          ...newPromptData,
          id: expect.stringMatching(/^prompt-\d+$/),
          created_at: expect.any(String),
          updated_at: expect.any(String),
        });
        expect(stubPromptStorage.data.length).toBe(initialLength + 1);
        expect(stubPromptStorage.getById(newPrompt.id)).toEqual(newPrompt);
      });
    });

    describe('update', () => {
      it('should update existing prompt', () => {
        const originalPrompt = stubPromptStorage.getById('prompt-1');
        const updates = {
          title: 'Updated Title',
          content: 'Updated content',
        };

        const updatedPrompt = stubPromptStorage.update('prompt-1', updates);

        expect(updatedPrompt).toMatchObject({
          ...originalPrompt,
          ...updates,
          updated_at: expect.any(String),
        });
        expect(updatedPrompt?.updated_at).not.toBe(originalPrompt?.updated_at);
      });

      it('should return null for non-existent prompt', () => {
        const result = stubPromptStorage.update('non-existent', { title: 'Test' });
        
        expect(result).toBeNull();
      });
    });

    describe('delete', () => {
      it('should delete existing prompt', () => {
        const initialLength = stubPromptStorage.data.length;
        const result = stubPromptStorage.delete('prompt-1');

        expect(result).toBe(true);
        expect(stubPromptStorage.data.length).toBe(initialLength - 1);
        expect(stubPromptStorage.getById('prompt-1')).toBeUndefined();
      });

      it('should return false for non-existent prompt', () => {
        const initialLength = stubPromptStorage.data.length;
        const result = stubPromptStorage.delete('non-existent');

        expect(result).toBe(false);
        expect(stubPromptStorage.data.length).toBe(initialLength);
      });
    });

    describe('search', () => {
      it('should find prompts by title', () => {
        const results = stubPromptStorage.search('コードレビュー');
        
        expect(results.length).toBeGreaterThan(0);
        expect(results.some(p => p.title.includes('コードレビュー'))).toBe(true);
      });

      it('should find prompts by content', () => {
        const results = stubPromptStorage.search('可読性');
        
        expect(results.length).toBeGreaterThan(0);
        expect(results.some(p => p.content.includes('可読性'))).toBe(true);
      });

      it('should find prompts by tag', () => {
        const results = stubPromptStorage.search('プログラミング');
        
        expect(results.length).toBeGreaterThan(0);
        expect(results.some(p => p.tags.includes('プログラミング'))).toBe(true);
      });

      it('should be case insensitive', () => {
        const results1 = stubPromptStorage.search('CODE');
        const results2 = stubPromptStorage.search('code');
        
        expect(results1.length).toBe(results2.length);
      });

      it('should return empty array for no matches', () => {
        const results = stubPromptStorage.search('xyzabc12345');
        
        expect(results).toEqual([]);
      });
    });
  });
});
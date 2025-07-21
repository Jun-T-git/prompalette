import { describe, it, expect, beforeEach } from 'vitest';
import {
  STUB_USER_SESSION,
  stubPromptStorage,
  STUB_PROMPTS,
} from '../auth-stub';

describe('Auth Stub - Simple Tests', () => {
  beforeEach(() => {
    // Reset data to original state
    stubPromptStorage.data = [...STUB_PROMPTS];
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

  describe('stubPromptStorage - Basic Operations', () => {
    it('should get all prompts', () => {
      const prompts = stubPromptStorage.getAll();
      
      expect(prompts).toHaveLength(STUB_PROMPTS.length);
      expect(prompts).toEqual(expect.arrayContaining(STUB_PROMPTS));
    });

    it('should get prompt by id', () => {
      const prompt = stubPromptStorage.getById('prompt-1');
      
      expect(prompt).toBeDefined();
      expect(prompt?.id).toBe('prompt-1');
    });

    it('should return undefined for non-existent id', () => {
      const prompt = stubPromptStorage.getById('non-existent');
      
      expect(prompt).toBeUndefined();
    });

    it('should get prompts by user id', () => {
      const prompts = stubPromptStorage.getByUserId('550e8400-e29b-41d4-a716-446655440000');
      
      expect(prompts.length).toBeGreaterThan(0);
      expect(prompts.every(p => p.user_id === '550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });

    it('should get only public prompts', () => {
      const prompts = stubPromptStorage.getPublic();
      
      expect(prompts.length).toBeGreaterThan(0);
      expect(prompts.every(p => p.is_public === true)).toBe(true);
    });

    it('should create new prompt', () => {
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
    });

    it('should search prompts', () => {
      const results = stubPromptStorage.search('コードレビュー');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(p => p.title.includes('コードレビュー'))).toBe(true);
    });

    it('should delete prompt', () => {
      const initialLength = stubPromptStorage.data.length;
      const result = stubPromptStorage.delete('prompt-1');

      expect(result).toBe(true);
      expect(stubPromptStorage.data.length).toBe(initialLength - 1);
    });
  });
});
import type { Prompt } from '../types/prompt';

import { getDisplayTitle, hasValidTitle, getSafeTitle, getTooltipTitle } from './promptDisplay';

// テスト用のプロンプトファクトリ
const createPrompt = (overrides: Partial<Prompt> = {}): Prompt => ({
  id: 'test-id',
  title: null,
  content: 'Test content',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

describe('promptDisplay utilities', () => {
  describe('getDisplayTitle', () => {
    it('returns trimmed title when valid title exists', () => {
      const prompt = createPrompt({ title: '  My Title  ' });
      expect(getDisplayTitle(prompt)).toBe('My Title');
    });

    it('returns preview from content when title is null', () => {
      const prompt = createPrompt({ 
        title: null, 
        content: 'This is a long content that should be truncated' 
      });
      expect(getDisplayTitle(prompt)).toBe('This is a long content that should be truncated...');
    });

    it('returns preview from content when title is empty string', () => {
      const prompt = createPrompt({ 
        title: '', 
        content: 'Content preview' 
      });
      expect(getDisplayTitle(prompt)).toBe('Content preview...');
    });

    it('truncates long content preview to 50 characters', () => {
      const longContent = 'A'.repeat(100);
      const prompt = createPrompt({ 
        title: null, 
        content: longContent 
      });
      expect(getDisplayTitle(prompt)).toBe('A'.repeat(50) + '...');
    });

    it('uses first line only for preview', () => {
      const prompt = createPrompt({ 
        title: null, 
        content: 'First line\nSecond line\nThird line' 
      });
      expect(getDisplayTitle(prompt)).toBe('First line...');
    });

    it('returns default title when both title and content are empty', () => {
      const prompt = createPrompt({ 
        title: null, 
        content: '' 
      });
      expect(getDisplayTitle(prompt)).toBe('無題のプロンプト');
    });

    it('handles whitespace-only content gracefully', () => {
      const prompt = createPrompt({ 
        title: null, 
        content: '   \n\n   ' 
      });
      expect(getDisplayTitle(prompt)).toBe('無題のプロンプト');
    });
  });

  describe('hasValidTitle', () => {
    it('returns true for non-empty title', () => {
      const prompt = createPrompt({ title: 'Valid Title' });
      expect(hasValidTitle(prompt)).toBe(true);
    });

    it('returns false for null title', () => {
      const prompt = createPrompt({ title: null });
      expect(hasValidTitle(prompt)).toBe(false);
    });

    it('returns false for empty string title', () => {
      const prompt = createPrompt({ title: '' });
      expect(hasValidTitle(prompt)).toBe(false);
    });

    it('returns false for whitespace-only title', () => {
      const prompt = createPrompt({ title: '   ' });
      expect(hasValidTitle(prompt)).toBe(false);
    });
  });

  describe('getSafeTitle', () => {
    it('returns trimmed title when valid', () => {
      const prompt = createPrompt({ title: '  Safe Title  ' });
      expect(getSafeTitle(prompt)).toBe('Safe Title');
    });

    it('returns default title when invalid', () => {
      const prompt = createPrompt({ title: null });
      expect(getSafeTitle(prompt)).toBe('無題のプロンプト');
    });
  });

  describe('getTooltipTitle', () => {
    it('returns title when valid', () => {
      const prompt = createPrompt({ title: 'Tooltip Title' });
      expect(getTooltipTitle(prompt)).toBe('Tooltip Title');
    });

    it('returns longer preview for tooltip when no title', () => {
      const longContent = 'A'.repeat(150);
      const prompt = createPrompt({ 
        title: null, 
        content: longContent 
      });
      expect(getTooltipTitle(prompt)).toBe('A'.repeat(100));
    });

    it('returns default when no title and no content', () => {
      const prompt = createPrompt({ 
        title: null, 
        content: '' 
      });
      expect(getTooltipTitle(prompt)).toBe('無題のプロンプト');
    });
  });

  describe('Edge cases', () => {
    it('handles undefined content gracefully', () => {
      const prompt = createPrompt({ 
        title: null, 
        content: undefined as any 
      });
      expect(getDisplayTitle(prompt)).toBe('無題のプロンプト');
    });

    it('handles non-string content gracefully', () => {
      const prompt = createPrompt({ 
        title: null, 
        content: 123 as any 
      });
      expect(getDisplayTitle(prompt)).toBe('無題のプロンプト');
    });
  });
});
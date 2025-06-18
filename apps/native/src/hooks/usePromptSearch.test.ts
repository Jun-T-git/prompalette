import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import type { Prompt } from '../types/prompt';

import { usePromptSearch } from './usePromptSearch';


const mockPrompts: Prompt[] = [
  {
    id: 'prm_1',
    title: 'TypeScript Review Guidelines',
    content: 'This is a comprehensive guide for TypeScript code review best practices.',
    tags: ['review', 'typescript', 'guidelines'],
    quickAccessKey: 'rvw',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'prm_2',
    title: 'React Component Testing',
    content: 'How to test React components effectively using Jest and React Testing Library.',
    tags: ['react', 'testing', 'jest'],
    quickAccessKey: 'rct',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  },
  {
    id: 'prm_3',
    title: 'Database Migration Scripts',
    content: 'SQL scripts for database migrations and schema updates.',
    tags: ['database', 'sql', 'migration'],
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z'
  },
  {
    id: 'prm_4',
    title: 'Code Review Checklist',
    content: 'Essential items to check during code review process.',
    tags: ['review', 'checklist'],
    created_at: '2024-01-04T00:00:00Z',
    updated_at: '2024-01-04T00:00:00Z'
  }
];

describe('usePromptSearch', () => {
  describe('Quick Access Key search', () => {
    it('should find prompt by quick access key', () => {
      const { result } = renderHook(() => usePromptSearch(mockPrompts, '/rvw'));
      
      expect(result.current.results).toHaveLength(1);
      expect(result.current.results[0].item.id).toBe('prm_1');
      expect(result.current.results[0].matchType).toBe('quickAccess');
    });

    it('should prioritize quick access key matches', () => {
      const { result } = renderHook(() => usePromptSearch(mockPrompts, '/rvw review'));
      
      expect(result.current.results).toHaveLength(1);
      expect(result.current.results[0].item.id).toBe('prm_1');
      expect(result.current.results[0].matchType).toBe('mixed');
    });

    it('should return empty results for non-existent quick access key', () => {
      const { result } = renderHook(() => usePromptSearch(mockPrompts, '/xyz'));
      
      expect(result.current.results).toHaveLength(0);
    });
  });

  describe('Tag search', () => {
    it('should find prompts by single tag', () => {
      const { result } = renderHook(() => usePromptSearch(mockPrompts, '#review'));
      
      expect(result.current.results).toHaveLength(2);
      const promptIds = result.current.results.map(r => r.item.id);
      expect(promptIds).toContain('prm_1');
      expect(promptIds).toContain('prm_4');
    });

    it('should filter by multiple tags (AND logic)', () => {
      const { result } = renderHook(() => usePromptSearch(mockPrompts, '#review #typescript'));
      
      expect(result.current.results).toHaveLength(1);
      expect(result.current.results[0].item.id).toBe('prm_1');
    });

    it('should return empty results when no prompts match all tags', () => {
      const { result } = renderHook(() => usePromptSearch(mockPrompts, '#review #react'));
      
      expect(result.current.results).toHaveLength(0);
    });
  });

  describe('Text search', () => {
    it('should find prompts by title', () => {
      const { result } = renderHook(() => usePromptSearch(mockPrompts, 'typescript'));
      
      expect(result.current.results).toHaveLength(1);
      expect(result.current.results[0].item.id).toBe('prm_1');
      expect(result.current.results[0].matchType).toBe('title');
    });

    it('should find prompts by content', () => {
      const { result } = renderHook(() => usePromptSearch(mockPrompts, 'Jest'));
      
      expect(result.current.results).toHaveLength(1);
      expect(result.current.results[0].item.id).toBe('prm_2');
      // Jest appears in both tags and content, but tag match has higher priority
      expect(result.current.results[0].matchType).toBe('title');
    });

    it('should handle multiple text terms (AND logic)', () => {
      const { result } = renderHook(() => usePromptSearch(mockPrompts, 'React testing'));
      
      expect(result.current.results).toHaveLength(1);
      expect(result.current.results[0].item.id).toBe('prm_2');
    });

    it('should be case insensitive', () => {
      const { result } = renderHook(() => usePromptSearch(mockPrompts, 'TYPESCRIPT'));
      
      expect(result.current.results).toHaveLength(1);
      expect(result.current.results[0].item.id).toBe('prm_1');
    });
  });

  describe('Combined search', () => {
    it('should handle mixed query with tags and text', () => {
      const { result } = renderHook(() => usePromptSearch(mockPrompts, '#review TypeScript'));
      
      expect(result.current.results).toHaveLength(1);
      expect(result.current.results[0].item.id).toBe('prm_1');
      expect(result.current.results[0].matchType).toBe('mixed');
    });

    it('should handle Japanese tags with English text', () => {
      const promptsWithJapanese: Prompt[] = [
        {
          ...mockPrompts[0]!,
          tags: ['レビュー', 'TypeScript']
        }
      ];
      
      const { result } = renderHook(() => usePromptSearch(promptsWithJapanese, '#レビュー TypeScript'));
      
      expect(result.current.results).toHaveLength(1);
      expect(result.current.results[0].item.id).toBe('prm_1');
    });
  });

  describe('Result ranking', () => {
    it('should rank results by score in descending order', () => {
      const { result } = renderHook(() => usePromptSearch(mockPrompts, 'review'));
      
      expect(result.current.results.length).toBeGreaterThan(1);
      
      for (let i = 0; i < result.current.results.length - 1; i++) {
        expect(result.current.results[i].score).toBeGreaterThanOrEqual(
          result.current.results[i + 1].score
        );
      }
    });
  });

  describe('Empty and edge cases', () => {
    it('should return all prompts for empty query', () => {
      const { result } = renderHook(() => usePromptSearch(mockPrompts, ''));
      
      expect(result.current.results).toHaveLength(mockPrompts.length);
      result.current.results.forEach((result, index) => {
        expect(result.item).toEqual(mockPrompts[index]);
      });
    });

    it('should return empty results for no matches', () => {
      const { result } = renderHook(() => usePromptSearch(mockPrompts, 'nonexistent'));
      
      expect(result.current.results).toHaveLength(0);
    });

    it('should handle empty prompts array', () => {
      const { result } = renderHook(() => usePromptSearch([], 'test'));
      
      expect(result.current.results).toHaveLength(0);
    });
  });

  describe('Parsed query exposure', () => {
    it('should expose parsed query information', () => {
      const { result } = renderHook(() => usePromptSearch(mockPrompts, '/rvw #review typescript'));
      
      expect(result.current.parsedQuery).toEqual({
        quickAccessKey: 'rvw',
        tags: ['review'],
        textTerms: ['typescript'],
        originalQuery: '/rvw #review typescript'
      });
    });
  });
});
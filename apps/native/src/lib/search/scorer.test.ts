import { describe, it, expect } from 'vitest';

import type { Prompt } from '../../types/prompt';

import { scoreSearchResults } from './scorer';
import type { ParsedSearchQuery, SearchConfig } from './types';

const testConfig: SearchConfig = {
  scores: {
    quickAccessMatch: 1000,
    exactTagMatch: 100,
    titleMatch: 50,
    contentMatch: 10,
    fuzzyTitleMatch: 25,
    fuzzyContentMatch: 5,
  },
};

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

describe('scoreSearchResults', () => {
  describe('Quick Access Key matching', () => {
    it('should score quick access key matches highest', () => {
      const query: ParsedSearchQuery = {
        quickAccessKey: 'rvw',
        tags: [],
        textTerms: [],
        originalQuery: '/rvw'
      };

      const results = scoreSearchResults(mockPrompts, query, testConfig);
      
      expect(results).toHaveLength(1);
      expect(results[0]?.item.id).toBe('prm_1');
      expect(results[0]?.score).toBe(testConfig.scores.quickAccessMatch);
      expect(results[0]?.matchType).toBe('quickAccess');
      expect(results[0]?.matchedTerms).toEqual(['rvw']);
    });

    it('should not match non-existent quick access key', () => {
      const query: ParsedSearchQuery = {
        quickAccessKey: 'xyz',
        tags: [],
        textTerms: [],
        originalQuery: '/xyz'
      };

      const results = scoreSearchResults(mockPrompts, query, testConfig);
      expect(results).toHaveLength(0);
    });
  });

  describe('Tag matching', () => {
    it('should score exact tag matches highly', () => {
      const query: ParsedSearchQuery = {
        quickAccessKey: undefined,
        tags: ['review'],
        textTerms: [],
        originalQuery: '#review'
      };

      const results = scoreSearchResults(mockPrompts, query, testConfig);
      
      expect(results).toHaveLength(2);
      expect(results[0]?.score).toBe(testConfig.scores.exactTagMatch);
      expect(results[0]?.matchType).toBe('tag');
      expect(results[0]?.matchedTerms).toEqual(['review']);
      
      // Both prompts with 'review' tag should be returned
      const promptIds = results.map(r => r.item.id);
      expect(promptIds).toContain('prm_1');
      expect(promptIds).toContain('prm_4');
    });

    it('should handle multiple tag filtering', () => {
      const query: ParsedSearchQuery = {
        quickAccessKey: undefined,
        tags: ['review', 'typescript'],
        textTerms: [],
        originalQuery: '#review #typescript'
      };

      const results = scoreSearchResults(mockPrompts, query, testConfig);
      
      expect(results).toHaveLength(1);
      expect(results[0].item.id).toBe('prm_1');
      expect(results[0].matchedTerms).toEqual(['review', 'typescript']);
    });
  });

  describe('Text term matching', () => {
    it('should score title matches higher than content matches', () => {
      const query: ParsedSearchQuery = {
        quickAccessKey: undefined,
        tags: [],
        textTerms: ['typescript'],
        originalQuery: 'typescript'
      };

      const results = scoreSearchResults(mockPrompts, query, testConfig);
      
      expect(results).toHaveLength(1);
      expect(results[0].item.id).toBe('prm_1');
      expect(results[0].matchType).toBe('title');
      expect(results[0].score).toBe(testConfig.scores.titleMatch);
    });

    it('should find content matches', () => {
      const query: ParsedSearchQuery = {
        quickAccessKey: undefined,
        tags: [],
        textTerms: ['Jest'],
        originalQuery: 'Jest'
      };

      const results = scoreSearchResults(mockPrompts, query, testConfig);
      
      expect(results).toHaveLength(1);
      expect(results[0].item.id).toBe('prm_2');
      // Jest appears in both tags and content, but tag match has higher priority
      expect(results[0].matchType).toBe('title');
      expect(results[0].score).toBe(testConfig.scores.titleMatch);
    });

    it('should find content-only matches', () => {
      const query: ParsedSearchQuery = {
        quickAccessKey: undefined,
        tags: [],
        textTerms: ['comprehensive'],
        originalQuery: 'comprehensive'
      };

      const results = scoreSearchResults(mockPrompts, query, testConfig);
      
      expect(results).toHaveLength(1);
      expect(results[0].item.id).toBe('prm_1');
      // 'comprehensive' only appears in content, not in tags/title/quickAccessKey
      expect(results[0].matchType).toBe('content');
      expect(results[0].score).toBe(testConfig.scores.contentMatch);
    });

    it('should handle multiple text terms (AND logic)', () => {
      const query: ParsedSearchQuery = {
        quickAccessKey: undefined,
        tags: [],
        textTerms: ['React', 'testing'],
        originalQuery: 'React testing'
      };

      const results = scoreSearchResults(mockPrompts, query, testConfig);
      
      expect(results).toHaveLength(1);
      expect(results[0].item.id).toBe('prm_2');
      expect(results[0].matchedTerms).toEqual(['React', 'testing']);
    });

    it('should be case insensitive', () => {
      const query: ParsedSearchQuery = {
        quickAccessKey: undefined,
        tags: [],
        textTerms: ['TYPESCRIPT'],
        originalQuery: 'TYPESCRIPT'
      };

      const results = scoreSearchResults(mockPrompts, query, testConfig);
      
      expect(results).toHaveLength(1);
      expect(results[0].item.id).toBe('prm_1');
    });
  });

  describe('Combined search', () => {
    it('should handle quick access key with additional filters', () => {
      const query: ParsedSearchQuery = {
        quickAccessKey: 'rvw',
        tags: ['typescript'],
        textTerms: ['guide'],
        originalQuery: '/rvw #typescript guide'
      };

      const results = scoreSearchResults(mockPrompts, query, testConfig);
      
      expect(results).toHaveLength(1);
      expect(results[0].item.id).toBe('prm_1');
      expect(results[0].matchType).toBe('mixed');
      expect(results[0].matchedTerms).toEqual(['rvw', 'typescript', 'guide']);
    });

    it('should return empty results if all conditions are not met', () => {
      const query: ParsedSearchQuery = {
        quickAccessKey: 'rvw',
        tags: ['nonexistent'],
        textTerms: [],
        originalQuery: '/rvw #nonexistent'
      };

      const results = scoreSearchResults(mockPrompts, query, testConfig);
      expect(results).toHaveLength(0);
    });
  });

  describe('Result ranking', () => {
    it('should rank results by score in descending order', () => {
      const query: ParsedSearchQuery = {
        quickAccessKey: undefined,
        tags: [],
        textTerms: ['review'],
        originalQuery: 'review'
      };

      const results = scoreSearchResults(mockPrompts, query, testConfig);
      
      // Should have multiple results
      expect(results.length).toBeGreaterThan(1);
      
      // Should be sorted by score descending
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].score).toBeGreaterThanOrEqual(results[i + 1].score);
      }
    });

    it('should prioritize quick access matches over all others', () => {
      const query: ParsedSearchQuery = {
        quickAccessKey: 'rvw',
        tags: [],
        textTerms: [],
        originalQuery: '/rvw'
      };

      const results = scoreSearchResults(mockPrompts, query, testConfig);
      
      expect(results).toHaveLength(1);
      expect(results[0].item.id).toBe('prm_1');
      expect(results[0].matchType).toBe('quickAccess');
      expect(results[0].score).toBe(testConfig.scores.quickAccessMatch);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty query', () => {
      const query: ParsedSearchQuery = {
        quickAccessKey: undefined,
        tags: [],
        textTerms: [],
        originalQuery: ''
      };

      const results = scoreSearchResults(mockPrompts, query, testConfig);
      expect(results).toHaveLength(0);
    });

    it('should handle empty prompts array', () => {
      const query: ParsedSearchQuery = {
        quickAccessKey: 'rvw',
        tags: [],
        textTerms: [],
        originalQuery: '/rvw'
      };

      const results = scoreSearchResults([], query);
      expect(results).toHaveLength(0);
    });

    it('should handle prompts without quickAccessKey', () => {
      const promptsWithoutKey = mockPrompts.map(p => ({ ...p, quickAccessKey: undefined }));
      
      const query: ParsedSearchQuery = {
        quickAccessKey: 'rvw',
        tags: [],
        textTerms: [],
        originalQuery: '/rvw'
      };

      const results = scoreSearchResults(promptsWithoutKey, query);
      expect(results).toHaveLength(0);
    });
  });
});
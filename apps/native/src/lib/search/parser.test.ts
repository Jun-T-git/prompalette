import { describe, it, expect } from 'vitest';

import { parseSearchQuery } from './parser';

describe('parseSearchQuery', () => {
  describe('Quick Access Key parsing', () => {
    it('should parse single quick access key', () => {
      const result = parseSearchQuery('/rvw');
      expect(result).toEqual({
        quickAccessKey: 'rvw',
        tags: [],
        textTerms: [],
        originalQuery: '/rvw'
      });
    });

    it('should parse quick access key with other terms', () => {
      const result = parseSearchQuery('/rvw typescript review');
      expect(result).toEqual({
        quickAccessKey: 'rvw',
        tags: [],
        textTerms: ['typescript', 'review'],
        originalQuery: '/rvw typescript review'
      });
    });

    it('should handle quick access key with tags', () => {
      const result = parseSearchQuery('/rvw #review #code');
      expect(result).toEqual({
        quickAccessKey: 'rvw',
        tags: ['review', 'code'],
        textTerms: [],
        originalQuery: '/rvw #review #code'
      });
    });

    it('should only parse the first quick access key', () => {
      const result = parseSearchQuery('/rvw /test');
      expect(result).toEqual({
        quickAccessKey: 'rvw',
        tags: [],
        textTerms: ['/test'],
        originalQuery: '/rvw /test'
      });
    });

    it('should handle alphanumeric quick access keys', () => {
      const result = parseSearchQuery('/abc123');
      expect(result).toEqual({
        quickAccessKey: 'abc123',
        tags: [],
        textTerms: [],
        originalQuery: '/abc123'
      });
    });

    it('should not parse invalid quick access keys', () => {
      const result = parseSearchQuery('/');
      expect(result).toEqual({
        quickAccessKey: undefined,
        tags: [],
        textTerms: ['/'],
        originalQuery: '/'
      });
    });
  });

  describe('Tag parsing', () => {
    it('should parse single tag', () => {
      const result = parseSearchQuery('#review');
      expect(result).toEqual({
        quickAccessKey: undefined,
        tags: ['review'],
        textTerms: [],
        originalQuery: '#review'
      });
    });

    it('should parse multiple tags', () => {
      const result = parseSearchQuery('#review #code #typescript');
      expect(result).toEqual({
        quickAccessKey: undefined,
        tags: ['review', 'code', 'typescript'],
        textTerms: [],
        originalQuery: '#review #code #typescript'
      });
    });

    it('should parse Japanese tags', () => {
      const result = parseSearchQuery('#レビュー #コード');
      expect(result).toEqual({
        quickAccessKey: undefined,
        tags: ['レビュー', 'コード'],
        textTerms: [],
        originalQuery: '#レビュー #コード'
      });
    });

    it('should parse tags with underscores and hyphens', () => {
      const result = parseSearchQuery('#code_review #front-end');
      expect(result).toEqual({
        quickAccessKey: undefined,
        tags: ['code_review', 'front-end'],
        textTerms: [],
        originalQuery: '#code_review #front-end'
      });
    });

    it('should not parse invalid tags', () => {
      const result = parseSearchQuery('#');
      expect(result).toEqual({
        quickAccessKey: undefined,
        tags: [],
        textTerms: ['#'],
        originalQuery: '#'
      });
    });
  });

  describe('Text term parsing', () => {
    it('should parse single text term', () => {
      const result = parseSearchQuery('typescript');
      expect(result).toEqual({
        quickAccessKey: undefined,
        tags: [],
        textTerms: ['typescript'],
        originalQuery: 'typescript'
      });
    });

    it('should parse multiple text terms', () => {
      const result = parseSearchQuery('typescript react component');
      expect(result).toEqual({
        quickAccessKey: undefined,
        tags: [],
        textTerms: ['typescript', 'react', 'component'],
        originalQuery: 'typescript react component'
      });
    });

    it('should handle extra whitespace', () => {
      const result = parseSearchQuery('  typescript   react  ');
      expect(result).toEqual({
        quickAccessKey: undefined,
        tags: [],
        textTerms: ['typescript', 'react'],
        originalQuery: '  typescript   react  '
      });
    });
  });

  describe('Combined parsing', () => {
    it('should parse complex query with all elements', () => {
      const result = parseSearchQuery('/rvw #review #code typescript react');
      expect(result).toEqual({
        quickAccessKey: 'rvw',
        tags: ['review', 'code'],
        textTerms: ['typescript', 'react'],
        originalQuery: '/rvw #review #code typescript react'
      });
    });

    it('should parse mixed order query', () => {
      const result = parseSearchQuery('#review typescript /rvw react #code');
      expect(result).toEqual({
        quickAccessKey: 'rvw',
        tags: ['review', 'code'],
        textTerms: ['typescript', 'react'],
        originalQuery: '#review typescript /rvw react #code'
      });
    });

    it('should handle Japanese mixed with English', () => {
      const result = parseSearchQuery('#レビュー OSS TypeScript');
      expect(result).toEqual({
        quickAccessKey: undefined,
        tags: ['レビュー'],
        textTerms: ['OSS', 'TypeScript'],
        originalQuery: '#レビュー OSS TypeScript'
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty query', () => {
      const result = parseSearchQuery('');
      expect(result).toEqual({
        quickAccessKey: undefined,
        tags: [],
        textTerms: [],
        originalQuery: ''
      });
    });

    it('should handle whitespace only query', () => {
      const result = parseSearchQuery('   ');
      expect(result).toEqual({
        quickAccessKey: undefined,
        tags: [],
        textTerms: [],
        originalQuery: '   '
      });
    });

    it('should handle query with only symbols', () => {
      const result = parseSearchQuery('!@#$%^&*()');
      expect(result).toEqual({
        quickAccessKey: undefined,
        tags: [],
        textTerms: ['!@#$%^&*()'],
        originalQuery: '!@#$%^&*()'
      });
    });
  });
});
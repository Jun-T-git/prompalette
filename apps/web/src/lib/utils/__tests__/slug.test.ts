import { describe, it, expect } from 'vitest';
import { generateSlug, generateUniqueSlug, isValidSlug, slugToTitle } from '../slug';

describe('slug utilities', () => {
  describe('generateSlug', () => {
    it('should use quickAccessKey when provided', () => {
      const result = generateSlug('Some Title', 'quickkey');
      expect(result).toBe('quickkey');
    });

    it('should convert title to slug when no quickAccessKey', () => {
      const result = generateSlug('Hello World Example');
      expect(result).toBe('hello-world-example');
    });

    it('should remove special characters', () => {
      const result = generateSlug('Hello! @World# $Example%');
      expect(result).toBe('hello-world-example');
    });

    it('should replace multiple spaces with single hyphens', () => {
      const result = generateSlug('Hello     World');
      expect(result).toBe('hello-world');
    });

    it('should limit length to 50 characters', () => {
      const longTitle = 'This is a very long title that exceeds fifty characters and should be truncated';
      const result = generateSlug(longTitle);
      expect(result.length).toBeLessThanOrEqual(50);
      expect(result).toBe('this-is-a-very-long-title-that-exceeds-fifty-chara');
    });

    it('should remove trailing hyphens', () => {
      const result = generateSlug('Hello World!');
      expect(result).toBe('hello-world');
    });

    it('should handle empty or undefined title', () => {
      expect(generateSlug('')).toBe('untitled');
      expect(generateSlug(undefined as any)).toBe('untitled');
    });

    it('should handle Japanese characters', () => {
      const result = generateSlug('こんにちは世界');
      expect(result).toBe('untitled'); // Non-ASCII characters are removed
    });

    it('should handle numbers in title', () => {
      const result = generateSlug('Version 2.0 Release');
      expect(result).toBe('version-20-release');
    });
  });

  describe('generateUniqueSlug', () => {
    it('should return original slug if not in existing list', () => {
      const result = generateUniqueSlug('hello-world', ['other-slug', 'another-slug']);
      expect(result).toBe('hello-world');
    });

    it('should append number if slug exists', () => {
      const result = generateUniqueSlug('hello-world', ['hello-world']);
      expect(result).toBe('hello-world-1');
    });

    it('should increment number until unique', () => {
      const existingSlugs = ['hello-world', 'hello-world-1', 'hello-world-2'];
      const result = generateUniqueSlug('hello-world', existingSlugs);
      expect(result).toBe('hello-world-3');
    });

    it('should handle empty existing slugs array', () => {
      const result = generateUniqueSlug('hello-world', []);
      expect(result).toBe('hello-world');
    });
  });

  describe('isValidSlug', () => {
    it('should validate correct slug format', () => {
      expect(isValidSlug('hello-world')).toBe(true);
      expect(isValidSlug('test123')).toBe(true);
      expect(isValidSlug('a')).toBe(true);
      expect(isValidSlug('hello-world-123')).toBe(true);
    });

    it('should reject invalid slug formats', () => {
      expect(isValidSlug('Hello-World')).toBe(false); // uppercase
      expect(isValidSlug('hello_world')).toBe(false); // underscore
      expect(isValidSlug('hello world')).toBe(false); // space
      expect(isValidSlug('hello!')).toBe(false); // special character
      expect(isValidSlug('')).toBe(false); // empty
      expect(isValidSlug('-hello')).toBe(false); // starts with hyphen
      expect(isValidSlug('hello-')).toBe(false); // ends with hyphen
      expect(isValidSlug('hello--world')).toBe(false); // double hyphen
    });

    it('should reject slugs that are too long', () => {
      const longSlug = 'a'.repeat(51);
      expect(isValidSlug(longSlug)).toBe(false);
    });
  });

  describe('slugToTitle', () => {
    it('should convert slug to readable title', () => {
      const result = slugToTitle('hello-world-example');
      expect(result).toBe('Hello World Example');
    });

    it('should handle single word', () => {
      const result = slugToTitle('hello');
      expect(result).toBe('Hello');
    });

    it('should handle numbers', () => {
      const result = slugToTitle('version-2-release');
      expect(result).toBe('Version 2 Release');
    });

    it('should handle empty string', () => {
      const result = slugToTitle('');
      expect(result).toBe('');
    });
  });
});
import { describe, it, expect, vi, beforeEach } from 'vitest';

import type { NavigationConfig } from '../../config/navigation';
import {
  getScrollBehavior,
  isElementInView,
  createRapidNavigationDetector,
  isHTMLElement,
  scrollElementIntoView,
  type TimeProvider,
  type MediaQueryProvider,
} from '../scrollUtils';

describe('scrollUtils', () => {
  const mockConfig: NavigationConfig = {
    navigationThrottleMs: 120,
    rapidNavigationThresholdMs: 250,
    respectReducedMotion: true,
    coordinationRatio: 250 / 120,
  };

  describe('getScrollBehavior', () => {
    it('should return auto when reduced motion is preferred', () => {
      const mockMediaQuery: MediaQueryProvider = {
        matchesReducedMotion: () => true,
      };

      expect(getScrollBehavior(false, mockConfig, mockMediaQuery)).toBe('auto');
      expect(getScrollBehavior(true, mockConfig, mockMediaQuery)).toBe('auto');
    });

    it('should return auto for rapid navigation when motion is allowed', () => {
      const mockMediaQuery: MediaQueryProvider = {
        matchesReducedMotion: () => false,
      };

      expect(getScrollBehavior(true, mockConfig, mockMediaQuery)).toBe('auto');
    });

    it('should return smooth for normal navigation when motion is allowed', () => {
      const mockMediaQuery: MediaQueryProvider = {
        matchesReducedMotion: () => false,
      };

      expect(getScrollBehavior(false, mockConfig, mockMediaQuery)).toBe('smooth');
    });

    it('should ignore reduced motion when respectReducedMotion is false', () => {
      const configWithoutReducedMotion = { ...mockConfig, respectReducedMotion: false };
      const mockMediaQuery: MediaQueryProvider = {
        matchesReducedMotion: () => true,
      };

      expect(getScrollBehavior(false, configWithoutReducedMotion, mockMediaQuery)).toBe('smooth');
      expect(getScrollBehavior(true, configWithoutReducedMotion, mockMediaQuery)).toBe('auto');
    });
  });

  describe('isHTMLElement', () => {
    it('should return true for HTMLElement', () => {
      const element = document.createElement('div');
      expect(isHTMLElement(element)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isHTMLElement(null)).toBe(false);
    });

    it('should return false for non-HTMLElement', () => {
      const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      expect(isHTMLElement(svgElement)).toBe(false);
    });
  });

  describe('createRapidNavigationDetector', () => {
    let mockTimeProvider: TimeProvider;

    beforeEach(() => {
      mockTimeProvider = {
        now: vi.fn(),
      };
    });

    it('should detect rapid navigation within threshold', () => {
      vi.mocked(mockTimeProvider.now)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(100);

      const detector = createRapidNavigationDetector(mockConfig, mockTimeProvider);
      
      detector(); // First call
      const isRapid = detector(); // Second call within 250ms
      
      expect(isRapid).toBe(true);
    });

    it('should not detect rapid navigation beyond threshold', () => {
      vi.mocked(mockTimeProvider.now)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(300);

      const detector = createRapidNavigationDetector(mockConfig, mockTimeProvider);
      
      detector(); // First call
      const isRapid = detector(); // Second call after 300ms
      
      expect(isRapid).toBe(false);
    });

    it('should handle edge case at exact threshold', () => {
      vi.mocked(mockTimeProvider.now)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(250);

      const detector = createRapidNavigationDetector(mockConfig, mockTimeProvider);
      
      detector(); // First call
      const isRapid = detector(); // Second call at exactly 250ms
      
      expect(isRapid).toBe(false);
    });
  });

  describe('isElementInView', () => {
    let container: HTMLElement;
    let element: HTMLElement;

    beforeEach(() => {
      container = document.createElement('div');
      element = document.createElement('div');
      
      // Mock getBoundingClientRect
      vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
        top: 0,
        bottom: 100,
        left: 0,
        right: 100,
        width: 100,
        height: 100,
        x: 0,
        y: 0,
        toJSON: vi.fn(),
      });
    });

    it('should return true when element is fully visible', () => {
      vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
        top: 20,
        bottom: 80,
        left: 0,
        right: 100,
        width: 100,
        height: 60,
        x: 0,
        y: 20,
        toJSON: vi.fn(),
      });

      expect(isElementInView(element, container)).toBe(true);
    });

    it('should return false when element is partially above', () => {
      vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
        top: -20,
        bottom: 50,
        left: 0,
        right: 100,
        width: 100,
        height: 70,
        x: 0,
        y: -20,
        toJSON: vi.fn(),
      });

      expect(isElementInView(element, container)).toBe(false);
    });

    it('should return false when element is partially below', () => {
      vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
        top: 50,
        bottom: 120,
        left: 0,
        right: 100,
        width: 100,
        height: 70,
        x: 0,
        y: 50,
        toJSON: vi.fn(),
      });

      expect(isElementInView(element, container)).toBe(false);
    });

    it('should handle errors gracefully', () => {
      vi.spyOn(container, 'getBoundingClientRect').mockImplementation(() => {
        throw new Error('Test error');
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      expect(isElementInView(element, container)).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to check element visibility:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('scrollElementIntoView', () => {
    let element: HTMLElement;
    let mockMediaQuery: MediaQueryProvider;

    beforeEach(() => {
      element = document.createElement('div');
      element.scrollIntoView = vi.fn();
      mockMediaQuery = {
        matchesReducedMotion: () => false,
      };
    });

    it('should call scrollIntoView with smooth behavior for normal navigation', () => {
      scrollElementIntoView(element, false, mockConfig, mockMediaQuery);

      expect(element.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    });

    it('should call scrollIntoView with auto behavior for rapid navigation', () => {
      scrollElementIntoView(element, true, mockConfig, mockMediaQuery);

      expect(element.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'auto',
        block: 'nearest',
        inline: 'nearest',
      });
    });

    it('should handle errors gracefully', () => {
      element.scrollIntoView = vi.fn().mockImplementation(() => {
        throw new Error('Test error');
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      expect(() => {
        scrollElementIntoView(element, false, mockConfig, mockMediaQuery);
      }).not.toThrow();
      
      expect(consoleSpy).toHaveBeenCalledWith('Scroll operation failed:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });
});
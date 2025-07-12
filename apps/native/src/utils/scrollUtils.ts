import type { NavigationConfig } from '../config/navigation';

/**
 * Interface for time provider to enable testing
 */
export interface TimeProvider {
  now(): number;
}

/**
 * Default time provider using Date.now
 */
export const defaultTimeProvider: TimeProvider = {
  now: () => Date.now(),
};

/**
 * Interface for media query provider to enable testing
 */
export interface MediaQueryProvider {
  matchesReducedMotion(): boolean;
}

/**
 * Default media query provider
 */
export const defaultMediaQueryProvider: MediaQueryProvider = {
  matchesReducedMotion: () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },
};

/**
 * Determines the appropriate scroll behavior based on navigation pattern and accessibility settings
 * @param isRapidNavigation - Whether this is part of a rapid navigation sequence
 * @param config - Navigation configuration
 * @param mediaQueryProvider - Media query provider for testing
 * @returns Appropriate ScrollBehavior
 */
export function getScrollBehavior(
  isRapidNavigation: boolean,
  config: NavigationConfig,
  mediaQueryProvider: MediaQueryProvider = defaultMediaQueryProvider
): ScrollBehavior {
  // Always respect user's reduced motion preference
  if (config.respectReducedMotion && mediaQueryProvider.matchesReducedMotion()) {
    return 'auto';
  }
  
  // Use instant scroll during rapid navigation to keep up with user input
  return isRapidNavigation ? 'auto' : 'smooth';
}

/**
 * Type guard for HTMLElement
 * Handles both null and undefined cases for maximum type safety
 */
export function isHTMLElement(element: Element | null | undefined): element is HTMLElement {
  return element instanceof HTMLElement;
}

/**
 * Safely checks if an element is within the visible area of its container
 * @param element - The element to check
 * @param container - The container element
 * @returns True if element is fully visible within container
 */
export function isElementInView(element: HTMLElement, container: HTMLElement): boolean {
  try {
    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    
    return (
      elementRect.top >= containerRect.top &&
      elementRect.bottom <= containerRect.bottom
    );
  } catch (error) {
    // Fallback for edge cases (e.g., element not in DOM)
    console.warn('Failed to check element visibility:', error);
    return false;
  }
}

/**
 * Safely scrolls an element into view with adaptive behavior
 * @param element - Element to scroll into view
 * @param isRapidNavigation - Whether this is rapid navigation
 * @param config - Navigation configuration
 * @param mediaQueryProvider - Media query provider for testing
 */
export function scrollElementIntoView(
  element: HTMLElement,
  isRapidNavigation: boolean,
  config: NavigationConfig,
  mediaQueryProvider: MediaQueryProvider = defaultMediaQueryProvider
): void {
  try {
    const behavior = getScrollBehavior(isRapidNavigation, config, mediaQueryProvider);
    
    element.scrollIntoView({
      behavior,
      block: 'nearest',
      inline: 'nearest'
    });
  } catch (error) {
    console.warn('Scroll operation failed:', error);
    // Silent fallback - don't throw to avoid breaking navigation
  }
}

/**
 * Creates a rapid navigation detector
 * @param config - Navigation configuration
 * @param timeProvider - Time provider for testing
 * @returns Function to detect rapid navigation
 */
export function createRapidNavigationDetector(
  config: NavigationConfig,
  timeProvider: TimeProvider = defaultTimeProvider
) {
  let lastNavigationTime = 0;
  
  return (): boolean => {
    const now = timeProvider.now();
    const timeSinceLastNavigation = now - lastNavigationTime;
    const isRapid = timeSinceLastNavigation < config.rapidNavigationThresholdMs;
    
    lastNavigationTime = now;
    return isRapid;
  };
}
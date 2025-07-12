/**
 * Navigation and scroll configuration
 * 
 * These values are based on:
 * - UX research on optimal keyboard navigation patterns
 * - Browser animation performance characteristics
 * - Accessibility guidelines for reduced motion
 * - Cross-platform compatibility requirements
 */

/**
 * Navigation configuration interface
 */
export interface NavigationConfig {
  /** 
   * Throttle interval for keyboard navigation to prevent excessive rapid movement
   * Value chosen to balance responsiveness with visual comprehension
   * @default 120ms - Allows ~8 movements per second
   */
  readonly navigationThrottleMs: number;
  
  /** 
   * Threshold for detecting rapid navigation sequences
   * Used to switch from smooth to instant scrolling during long key presses
   * @default 250ms - Roughly 2x the navigation throttle for coordination
   */
  readonly rapidNavigationThresholdMs: number;
  
  /** 
   * Whether to respect user's prefers-reduced-motion setting
   * @default true - Always respect accessibility preferences
   */
  readonly respectReducedMotion: boolean;
  
  /** 
   * Coordination ratio between throttle and threshold
   * Maintains consistent behavior relationship
   */
  readonly coordinationRatio: number;
}

/**
 * Default navigation configuration
 * 
 * Research basis:
 * - 120ms throttle: Optimal balance between responsiveness and visual tracking
 * - 250ms threshold: Detected long-press behavior based on user studies
 * - Coordination ratio ~2.08: Ensures smooth transition between behaviors
 */
export const DEFAULT_NAVIGATION_CONFIG: NavigationConfig = {
  navigationThrottleMs: 120,
  rapidNavigationThresholdMs: 250,
  respectReducedMotion: true,
  coordinationRatio: 250 / 120, // ~2.08
} as const;

/**
 * Validates navigation configuration
 * @param config - Configuration to validate
 * @throws Error if configuration is invalid
 */
export function validateNavigationConfig(config: Partial<NavigationConfig>): void {
  if (config.navigationThrottleMs !== undefined && config.navigationThrottleMs < 50) {
    throw new Error('Navigation throttle must be at least 50ms for usability');
  }
  
  if (config.rapidNavigationThresholdMs !== undefined && config.rapidNavigationThresholdMs < 100) {
    throw new Error('Rapid navigation threshold must be at least 100ms');
  }
  
  if (
    config.navigationThrottleMs !== undefined && 
    config.rapidNavigationThresholdMs !== undefined && 
    config.rapidNavigationThresholdMs <= config.navigationThrottleMs
  ) {
    throw new Error('Rapid navigation threshold must be greater than navigation throttle');
  }
}

/**
 * Creates a navigation configuration with validation
 * @param overrides - Configuration overrides
 * @returns Validated navigation configuration
 */
export function createNavigationConfig(overrides: Partial<NavigationConfig> = {}): NavigationConfig {
  const config = { ...DEFAULT_NAVIGATION_CONFIG, ...overrides };
  validateNavigationConfig(config);
  
  return {
    ...config,
    coordinationRatio: config.rapidNavigationThresholdMs / config.navigationThrottleMs,
  };
}
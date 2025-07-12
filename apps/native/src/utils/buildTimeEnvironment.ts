/**
 * Build-time environment utilities
 * 
 * This module provides compile-time environment detection using Vite's define feature.
 * All environment checks are resolved at build time, resulting in dead code elimination
 * and optimal bundle size.
 * 
 * Use this instead of runtime environment detection for:
 * - Debug feature toggling
 * - Development-only code
 * - Environment-specific behavior
 */

/**
 * Current application environment
 * Resolved at build time from APP_ENV or NODE_ENV
 */
export const APP_ENV = __APP_ENV__;

/**
 * Environment flags - resolved at build time
 * These will be replaced with boolean literals during build
 */
export const IS_DEVELOPMENT = __IS_DEVELOPMENT__;
export const IS_STAGING = __IS_STAGING__;
export const IS_PRODUCTION = __IS_PRODUCTION__;

/**
 * Check if debug features should be enabled
 * Only true in development environment
 */
export const DEBUG_ENABLED = IS_DEVELOPMENT;

/**
 * Check if enhanced logging should be enabled
 * True in development and staging environments
 */
export const ENHANCED_LOGGING = IS_DEVELOPMENT || IS_STAGING;

/**
 * Type-safe environment check utilities
 */
export const Environment = {
  isDevelopment: () => IS_DEVELOPMENT,
  isStaging: () => IS_STAGING,
  isProduction: () => IS_PRODUCTION,
  isDebugEnabled: () => DEBUG_ENABLED,
  isEnhancedLogging: () => ENHANCED_LOGGING,
  current: () => APP_ENV,
} as const;

// Simple exports for direct usage
export { IS_DEVELOPMENT as isDevelopment };
export { IS_STAGING as isStaging };
export { IS_PRODUCTION as isProduction };
export { APP_ENV as nodeEnv };
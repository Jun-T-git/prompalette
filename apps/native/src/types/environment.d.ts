/**
 * Build-time environment constants
 * These are injected by Vite during build and available globally
 */

declare const __APP_ENV__: 'development' | 'staging' | 'production';
declare const __IS_DEVELOPMENT__: boolean;
declare const __IS_STAGING__: boolean;
declare const __IS_PRODUCTION__: boolean;

// Extend Window interface for legacy debug features
interface Window {
  __keyboardContext?: import('../types/keyboard.types').ContextId;
  __keyboardProvider?: import('../providers/KeyboardProvider').KeyboardContextValue;
}
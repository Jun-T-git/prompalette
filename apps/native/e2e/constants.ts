/**
 * E2E test constants
 */

/**
 * Timeout values for E2E tests
 */
export const E2E_TIMEOUTS = {
  /** Short delay for UI state changes */
  SHORT_DELAY: 100,
  /** Medium delay for component initialization */
  MEDIUM_DELAY: 500,
  /** Long timeout for page loads */
  PAGE_LOAD: 5000,
} as const;

/**
 * Selector constants for E2E tests
 */
export const E2E_SELECTORS = {
  SIDEBAR: '[data-testid="sidebar"]',
  CONTENT_AREA: '[data-testid="content-area"]',
  PROMPT_LIST: '[data-testid="prompt-list"]',
  SEARCH_INPUT: '[data-testid="search-input"]',
} as const;
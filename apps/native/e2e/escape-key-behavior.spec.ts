import { test, expect } from '@playwright/test';

import { E2E_TIMEOUTS, E2E_SELECTORS } from './constants';

test('Escape key behavior - app remains functional', async ({ page }) => {
  await page.goto('/');
  
  // Wait for app to be fully loaded
  await expect(page.locator(E2E_SELECTORS.SIDEBAR)).toBeVisible();
  await expect(page.locator(E2E_SELECTORS.CONTENT_AREA)).toBeVisible();
  
  // Wait for app initialization
  await page.waitForTimeout(E2E_TIMEOUTS.MEDIUM_DELAY);
  
  // Press Escape key (in normal context, this should not crash the app)
  await page.keyboard.press('Escape');
  
  // Wait briefly for action to complete
  await page.waitForTimeout(E2E_TIMEOUTS.SHORT_DELAY);
  
  // Verify the app is still functional after Escape key press
  await expect(page.locator(E2E_SELECTORS.SIDEBAR)).toBeVisible();
  await expect(page.locator(E2E_SELECTORS.CONTENT_AREA)).toBeVisible();
  
  // Test that we can still interact with the app
  const promptList = page.locator(E2E_SELECTORS.PROMPT_LIST);
  if (await promptList.isVisible()) {
    await promptList.click();
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(E2E_TIMEOUTS.SHORT_DELAY);
  }
  
  // App should still be responsive
  await expect(page.locator(E2E_SELECTORS.SIDEBAR)).toBeVisible();
});

test('Escape key behavior - clear search first', async ({ page }) => {
  await page.goto('/');
  
  // Wait for app to be fully loaded
  await expect(page.locator(E2E_SELECTORS.SIDEBAR)).toBeVisible();
  await expect(page.locator(E2E_SELECTORS.CONTENT_AREA)).toBeVisible();
  
  // Wait for app initialization
  await page.waitForTimeout(E2E_TIMEOUTS.MEDIUM_DELAY);
  
  // Focus on search input and enter some text
  const searchInput = page.locator(E2E_SELECTORS.SEARCH_INPUT);
  await searchInput.first().focus();
  
  // Type the text character by character to trigger proper state updates
  await searchInput.first().type('test search');
  
  // Wait for search to process
  await page.waitForTimeout(E2E_TIMEOUTS.SHORT_DELAY);
  
  // Verify search input has content
  const searchValue = await searchInput.first().inputValue();
  expect(searchValue).toBe('test search');
  
  // Press Escape key - should clear search first
  await page.keyboard.press('Escape');
  
  // Wait for search clear action
  await page.waitForTimeout(E2E_TIMEOUTS.MEDIUM_DELAY);
  
  // Verify search was cleared
  const clearedSearchValue = await searchInput.first().inputValue();
  expect(clearedSearchValue).toBe('');
  
  // Verify app is still functional after clearing search
  await expect(page.locator(E2E_SELECTORS.SIDEBAR)).toBeVisible();
  await expect(page.locator(E2E_SELECTORS.CONTENT_AREA)).toBeVisible();
  
  // Press Escape again - should not crash the app
  await page.keyboard.press('Escape');
  
  // Wait for action
  await page.waitForTimeout(E2E_TIMEOUTS.SHORT_DELAY);
  
  // App should still be functional
  await expect(page.locator(E2E_SELECTORS.SIDEBAR)).toBeVisible();
  await expect(page.locator(E2E_SELECTORS.CONTENT_AREA)).toBeVisible();
});
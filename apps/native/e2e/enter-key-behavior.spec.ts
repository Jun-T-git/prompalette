import { test, expect } from '@playwright/test';

import { E2E_TIMEOUTS, E2E_SELECTORS } from './constants';

test('Enter key behavior in list context', async ({ page }) => {
  await page.goto('/');
  
  // Wait for app to be fully loaded
  await expect(page.locator(E2E_SELECTORS.SIDEBAR)).toBeVisible();
  await expect(page.locator(E2E_SELECTORS.CONTENT_AREA)).toBeVisible();
  
  // Wait for prompts to load by checking the prompt list container
  const promptList = page.locator(E2E_SELECTORS.PROMPT_LIST);
  await expect(promptList).toBeVisible({ timeout: E2E_TIMEOUTS.PAGE_LOAD });
  
  // Click on prompt list to ensure we're in the list context
  await promptList.click();
  
  // Wait for the first prompt to be selected
  await page.waitForTimeout(E2E_TIMEOUTS.SHORT_DELAY);
  
  // Press Enter key to trigger copy functionality
  await page.keyboard.press('Enter');
  
  // Wait for any clipboard operation to complete
  await page.waitForTimeout(E2E_TIMEOUTS.MEDIUM_DELAY);
  
  // Verify the app is still functional after Enter key press
  // The main verification is that the app doesn't crash and remains responsive
  await expect(page.locator(E2E_SELECTORS.SIDEBAR)).toBeVisible();
  await expect(page.locator(E2E_SELECTORS.CONTENT_AREA)).toBeVisible();
  
  // Verify we can still navigate after the Enter key operation
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(E2E_TIMEOUTS.SHORT_DELAY);
  
  // Verify the app is still responsive
  await expect(page.locator(E2E_SELECTORS.PROMPT_LIST)).toBeVisible();
  
  // Test that we can press Enter multiple times without breaking
  await page.keyboard.press('Enter');
  await page.waitForTimeout(E2E_TIMEOUTS.SHORT_DELAY);
  
  // App should still be functional
  await expect(page.locator(E2E_SELECTORS.SIDEBAR)).toBeVisible();
});
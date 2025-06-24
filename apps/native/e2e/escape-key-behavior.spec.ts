import { test, expect } from '@playwright/test';

import { E2E_TIMEOUTS, E2E_SELECTORS } from './constants';

test('Escape key behavior - hide window to background', async ({ page }) => {
  // Capture console logs to verify behavior
  const consoleLogs: string[] = [];
  page.on('console', msg => {
    consoleLogs.push(msg.text());
  });
  
  await page.goto('/');
  
  // Wait for app to be fully loaded
  await expect(page.locator(E2E_SELECTORS.SIDEBAR)).toBeVisible();
  await expect(page.locator(E2E_SELECTORS.CONTENT_AREA)).toBeVisible();
  
  // Wait for app initialization
  await page.waitForTimeout(E2E_TIMEOUTS.MEDIUM_DELAY);
  
  // Press Escape key to hide window
  await page.keyboard.press('Escape');
  
  // Wait briefly for action to complete
  await page.waitForTimeout(E2E_TIMEOUTS.SHORT_DELAY);
  
  // Check console logs for window hiding behavior
  const hideLogs = consoleLogs.filter(log => log.includes('Window hidden to background'));
  console.log('Window hide logs:', hideLogs);
  
  // Verify window hiding was triggered
  expect(hideLogs.length).toBeGreaterThan(0);
  
  // Verify the correct behavior message
  expect(hideLogs[hideLogs.length - 1]).toBe('Window hidden to background');
});

test('Escape key behavior - clear search first', async ({ page }) => {
  // Capture console logs to verify behavior
  const consoleLogs: string[] = [];
  page.on('console', msg => {
    consoleLogs.push(msg.text());
  });
  
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
  
  // Wait for the search results to update (instead of fixed timeout)
  await page.waitForFunction(() => {
    const searchResults = document.querySelectorAll('[data-testid="prompt-item"]');
    return searchResults.length >= 0;  // Wait for DOM to update
  }, { timeout: 2000 });
  
  // Verify search input has content
  const searchValue = await searchInput.first().inputValue();
  expect(searchValue).toBe('test search');
  
  // Press Escape key - should clear search first, not hide window
  await page.keyboard.press('Escape');
  
  // Wait for search clear action
  await page.waitForTimeout(E2E_TIMEOUTS.SHORT_DELAY);
  
  // Verify search was cleared
  const clearedSearchValue = await searchInput.first().inputValue();
  expect(clearedSearchValue).toBe('');
  
  // Check that window was NOT hidden (no hide logs)
  const hideLogs = consoleLogs.filter(log => log.includes('Window hidden to background'));
  expect(hideLogs.length).toBe(0);
  
  // Press Escape again - now should hide window
  await page.keyboard.press('Escape');
  
  // Wait for window hide action
  await page.waitForTimeout(E2E_TIMEOUTS.SHORT_DELAY);
  
  // Now check for window hiding
  const hideLogsAfterSecondEscape = consoleLogs.filter(log => log.includes('Window hidden to background'));
  expect(hideLogsAfterSecondEscape.length).toBeGreaterThan(0);
});
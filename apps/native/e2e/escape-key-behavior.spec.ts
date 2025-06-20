import { test, expect } from '@playwright/test';

test('Escape key behavior - hide window to background', async ({ page }) => {
  // Capture console logs to verify behavior
  const consoleLogs: string[] = [];
  page.on('console', msg => {
    consoleLogs.push(msg.text());
  });
  
  await page.goto('/');
  
  // Wait for app to be fully loaded
  await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
  await expect(page.locator('[data-testid="content-area"]')).toBeVisible();
  await page.waitForTimeout(1000);
  
  // Press Escape key to hide window
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  
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
  await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
  await expect(page.locator('[data-testid="content-area"]')).toBeVisible();
  await page.waitForTimeout(1000);
  
  // Focus on search input and enter some text
  const searchInput = page.locator('input[placeholder*="検索"], input[type="search"], input[placeholder*="search"], .search-input');
  await searchInput.first().focus();
  
  // Type the text character by character to trigger proper state updates
  await searchInput.first().type('test search');
  
  // Wait a bit to ensure debounced state update has completed
  await page.waitForTimeout(500);
  
  // Verify search input has content
  const searchValue = await searchInput.first().inputValue();
  expect(searchValue).toBe('test search');
  
  // Press Escape key - should clear search first, not hide window
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  
  // Verify search was cleared
  const clearedSearchValue = await searchInput.first().inputValue();
  expect(clearedSearchValue).toBe('');
  
  // Check that window was NOT hidden (no hide logs)
  const hideLogs = consoleLogs.filter(log => log.includes('Window hidden to background'));
  expect(hideLogs.length).toBe(0);
  
  // Press Escape again - now should hide window
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  
  // Now check for window hiding
  const hideLogsAfterSecondEscape = consoleLogs.filter(log => log.includes('Window hidden to background'));
  expect(hideLogsAfterSecondEscape.length).toBeGreaterThan(0);
});
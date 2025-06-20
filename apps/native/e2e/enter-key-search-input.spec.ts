import { test, expect } from '@playwright/test';

test('Enter key behavior when search input is focused', async ({ page }) => {
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
  
  // Focus on search input
  const searchInput = page.locator('input[placeholder*="検索"], input[type="search"], input[placeholder*="search"], .search-input');
  await searchInput.first().focus();
  
  // Verify search input has focus
  const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
  expect(focusedElement).toBe('INPUT');
  
  // Press Enter key while search input is focused
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
  
  // Check console logs for copy and hide behavior
  const copyLogs = consoleLogs.filter(log => log.includes('Copied prompt:'));
  const hideLogs = consoleLogs.filter(log => log.includes('Window hidden to background'));
  
  // The Enter key should copy the selected prompt and hide window
  expect(copyLogs.length).toBeGreaterThan(0);
  expect(hideLogs.length).toBeGreaterThan(0);
  
  // Verify no toast is shown
  const toasts = page.locator('[role="alert"], .toast, [data-testid="toast"]');
  await expect(toasts).toHaveCount(0);
  
  // Verify window hiding behavior
  expect(hideLogs[hideLogs.length - 1]).toBe('Window hidden to background');
});
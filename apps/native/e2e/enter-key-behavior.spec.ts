import { test, expect } from '@playwright/test';

test('Enter key behavior in list context', async ({ page }) => {
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
  
  // Click on prompt list to ensure we're in the list context
  const promptList = page.locator('[data-testid="prompt-list"]');
  await promptList.click();
  
  // Verify that a prompt is selected 
  const selectedPrompts = page.locator('.border-blue-500, .ring-blue-200');
  await expect(selectedPrompts.first()).toBeVisible();
  
  // Press Enter key
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
  
  // Check console logs for copy and hide behavior
  const copyLogs = consoleLogs.filter(log => log.includes('Copied prompt:'));
  const hideLogs = consoleLogs.filter(log => log.includes('Window hidden to background'));
  
  expect(copyLogs.length).toBeGreaterThan(0);
  expect(hideLogs.length).toBeGreaterThan(0);
  
  // Verify no toast is shown (check for toast elements)
  const toasts = page.locator('[role="alert"], .toast, [data-testid="toast"]');
  await expect(toasts).toHaveCount(0);
  
  // In real Tauri environment, window would be hidden to background
  // In E2E test environment, we verify both copy and hide logs
  const lastCopyLog = copyLogs[copyLogs.length - 1];
  expect(lastCopyLog).toContain('Test Prompt');
  expect(hideLogs[hideLogs.length - 1]).toBe('Window hidden to background');
});
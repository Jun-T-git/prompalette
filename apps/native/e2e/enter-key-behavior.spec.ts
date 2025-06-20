import { test, expect } from '@playwright/test';

import { E2E_TIMEOUTS, E2E_SELECTORS } from './constants';

test('Enter key behavior in list context', async ({ page }) => {
  // Capture console logs to verify behavior
  const consoleLogs: string[] = [];
  page.on('console', msg => {
    consoleLogs.push(msg.text());
  });
  
  await page.goto('/');
  
  // Wait for app to be fully loaded
  await expect(page.locator(E2E_SELECTORS.SIDEBAR)).toBeVisible();
  await expect(page.locator(E2E_SELECTORS.CONTENT_AREA)).toBeVisible();
  
  // Wait for prompts to load by checking the prompt list container
  const promptList = page.locator(E2E_SELECTORS.PROMPT_LIST);
  await expect(promptList).toBeVisible({ timeout: E2E_TIMEOUTS.PAGE_LOAD });
  
  // Click on prompt list to ensure we're in the list context
  await promptList.click();
  
  // Verify that a prompt is selected 
  const selectedPrompts = page.locator('.border-blue-500, .ring-blue-200');
  await expect(selectedPrompts.first()).toBeVisible();
  
  // Press Enter key
  await page.keyboard.press('Enter');
  
  // Wait for clipboard operation and window hide by checking console output
  await page.waitForTimeout(E2E_TIMEOUTS.SHORT_DELAY);
  
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
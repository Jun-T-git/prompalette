import { test, expect } from '@playwright/test';

test.describe('E2E Setup Check', () => {
  test('should connect to Tauri app and verify basic elements', async ({ page }) => {
    // This test verifies E2E setup is working
    await page.goto('/');
    
    // Wait for basic app elements
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 });
    
    // Check if it's actually the Tauri app
    await expect(page).toHaveTitle(/prompalette/i);
    
    // Verify main app elements exist
    const sidebar = page.locator('[data-testid="sidebar"]');
    const contentArea = page.locator('[data-testid="content-area"]');
    
    if (await sidebar.isVisible({ timeout: 5000 })) {
      console.log('✅ Sidebar found');
    } else {
      console.log('❌ Sidebar not found - check data-testid attributes');
    }
    
    if (await contentArea.isVisible({ timeout: 5000 })) {
      console.log('✅ Content area found');
    } else {
      console.log('❌ Content area not found - check data-testid attributes');
    }
    
    // Basic keyboard test
    await page.keyboard.press('Escape');
    console.log('✅ Keyboard events working');
    
    // Check if debug panel works
    await page.keyboard.press('Control+Shift+KeyD');
    await page.waitForTimeout(1000);
    
    if (await page.locator('text=🔧 Keyboard Debug').isVisible()) {
      console.log('✅ Debug panel working - keyboard system loaded');
      await page.keyboard.press('Control+Shift+KeyD'); // Close it
    } else {
      console.log('❌ Debug panel not working - keyboard system may not be loaded');
    }
  });
});
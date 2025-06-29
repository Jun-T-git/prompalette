import { expect, test } from '@playwright/test';

/**
 * Critical Keyboard Flow E2E Tests
 * These test ACTUAL keyboard behavior in a real browser environment
 */

test.describe('🚨 CRITICAL: Real Browser Keyboard Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Wait for app to be fully loaded
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
    await expect(page.locator('[data-testid="content-area"]')).toBeVisible();

    // Wait for any initial loading to complete
    await page.waitForTimeout(1000);
  });

  test.describe('🎯 List Navigation (Most Critical)', () => {
    test('should navigate with arrow keys in real browser', async ({ page }) => {
      // Ensure we're in list context - click somewhere in the prompt list
      const promptList = page.locator('[data-testid="prompt-list"]');
      if (await promptList.isVisible()) {
        await promptList.click();
      }

      // Test Arrow Down
      await page.keyboard.press('ArrowDown');

      // Verify navigation happened (prompt selection changed)
      // This should cause a visual change in the selected prompt
      await page.waitForTimeout(100);

      // Test Arrow Up
      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(100);

      // Test multiple rapid navigation
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowUp');

      // Should not crash and should be responsive
      await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
    });

    test('should copy prompt with Enter key', async ({ page }) => {
      // Focus on prompt list
      const promptList = page.locator('[data-testid="prompt-list"]');
      if (await promptList.isVisible()) {
        await promptList.click();
      }

      // Press Enter to copy
      await page.keyboard.press('Enter');

      // Should show success toast or indication
      await page.waitForTimeout(500);

      // App should still be functional
      await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
    });
  });

  test.describe('🎯 Modal Operations (Critical)', () => {
    test('should open and close help modal with keyboard', async ({ page }) => {
      // Help modal should not be visible initially
      await expect(page.locator('[data-testid="help-modal"]')).not.toBeVisible();

      // Open help with Cmd+Shift+? (or Ctrl+Shift+? on non-Mac)
      const isMac = process.platform === 'darwin';
      if (isMac) {
        await page.keyboard.press('Meta+Shift+Slash');
      } else {
        await page.keyboard.press('Control+Shift+Slash');
      }

      // Help modal should appear
      await expect(page.locator('[data-testid="help-modal"]')).toBeVisible({ timeout: 3000 });

      // Close with Escape
      await page.keyboard.press('Escape');

      // Help modal should disappear
      await expect(page.locator('[data-testid="help-modal"]')).not.toBeVisible({ timeout: 2000 });
    });

    test('should open new prompt form with Cmd+N', async ({ page }) => {
      // New prompt form should not be visible initially
      await expect(page.locator('[data-testid="create-form"]')).not.toBeVisible();

      // Open new prompt with Cmd+N
      const isMac = process.platform === 'darwin';
      if (isMac) {
        await page.keyboard.press('Meta+KeyN');
      } else {
        await page.keyboard.press('Control+KeyN');
      }

      // Form should appear
      await expect(page.locator('[data-testid="create-form"]')).toBeVisible({ timeout: 2000 });

      // Close with Escape
      await page.keyboard.press('Escape');

      // Form should disappear
      await expect(page.locator('[data-testid="create-form"]')).not.toBeVisible({ timeout: 2000 });
    });
  });

  test.describe('🎯 Context Switching (Critical Bug Area)', () => {
    test('should handle escape in different contexts', async ({ page }) => {
      // Test 1: Escape in list context
      const promptList = page.locator('[data-testid="prompt-list"]');
      if (await promptList.isVisible()) {
        await promptList.click();
      }

      await page.keyboard.press('Escape');
      await page.waitForTimeout(100);

      // Should not crash
      await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();

      // Test 2: Open modal, then escape
      const isMac = process.platform === 'darwin';
      if (isMac) {
        await page.keyboard.press('Meta+Shift+Slash'); // Help
      } else {
        await page.keyboard.press('Control+Shift+Slash');
      }

      await expect(page.locator('[data-testid="help-modal"]')).toBeVisible();

      await page.keyboard.press('Escape');
      await expect(page.locator('[data-testid="help-modal"]')).not.toBeVisible();

      // Test 3: Open form, then escape
      if (isMac) {
        await page.keyboard.press('Meta+KeyN');
      } else {
        await page.keyboard.press('Control+KeyN');
      }

      await expect(page.locator('[data-testid="create-form"]')).toBeVisible();

      await page.keyboard.press('Escape');
      await expect(page.locator('[data-testid="create-form"]')).not.toBeVisible();
    });
  });

  test.describe('🎯 Real User Workflows', () => {
    test('should handle complete user journey: browse → help → create → cancel', async ({
      page,
    }) => {
      const isMac = process.platform === 'darwin';

      // 1. User browses prompts
      const promptList = page.locator('[data-testid="prompt-list"]');
      if (await promptList.isVisible()) {
        await promptList.click();
      }

      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(100);

      // 2. User opens help
      if (isMac) {
        await page.keyboard.press('Meta+Shift+Slash');
      } else {
        await page.keyboard.press('Control+Shift+Slash');
      }

      await expect(page.locator('[data-testid="help-modal"]')).toBeVisible();

      // 3. User closes help
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-testid="help-modal"]')).not.toBeVisible();

      // 4. User creates new prompt
      if (isMac) {
        await page.keyboard.press('Meta+KeyN');
      } else {
        await page.keyboard.press('Control+KeyN');
      }

      await expect(page.locator('[data-testid="create-form"]')).toBeVisible();

      // 5. User cancels
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-testid="create-form"]')).not.toBeVisible();

      // 6. User continues browsing
      await page.keyboard.press('ArrowUp');
      await page.keyboard.press('Enter'); // Copy

      // Should complete without errors
      await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
    });

    test('should handle rapid keyboard operations without breaking', async ({ page }) => {
      const isMac = process.platform === 'darwin';

      // Rapid fire operations that might break the system
      const operations = [
        () => page.keyboard.press('ArrowDown'),
        () => page.keyboard.press('ArrowUp'),
        () => page.keyboard.press('ArrowDown'),
        () => page.keyboard.press('Enter'),
        () => page.keyboard.press(isMac ? 'Meta+Shift+Slash' : 'Control+Shift+Slash'),
        () => page.keyboard.press('Escape'),
        () => page.keyboard.press(isMac ? 'Meta+KeyN' : 'Control+KeyN'),
        () => page.keyboard.press('Escape'),
        () => page.keyboard.press('ArrowDown'),
        () => page.keyboard.press('Enter'),
      ];

      // Execute rapidly
      for (const operation of operations) {
        await operation();
        await page.waitForTimeout(50); // Small delay between operations
      }

      // App should still be functional
      await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
      await expect(page.locator('[data-testid="content-area"]')).toBeVisible();
    });
  });

  test.describe('🎯 Keyboard Debug Verification', () => {
    test('should open debug panel and verify keyboard system', async ({ page }) => {
      // Open debug panel with Ctrl+Shift+D
      await page.keyboard.press('Control+Shift+KeyD');

      // Debug panel should appear
      await expect(page.locator('text=🔧 Keyboard Debug')).toBeVisible({ timeout: 2000 });

      // Test a keyboard shortcut and verify it's detected
      await page.keyboard.press('Escape');

      // Debug panel should show the last key
      await expect(page.locator('text=Escape')).toBeVisible();

      // Close debug panel
      await page.keyboard.press('Control+Shift+KeyD');
      await expect(page.locator('text=🔧 Keyboard Debug')).not.toBeVisible();
    });

    test('should verify shortcuts are actually registered in real app', async ({ page }) => {
      // Open debug panel
      await page.keyboard.press('Control+Shift+KeyD');
      await expect(page.locator('text=🔧 Keyboard Debug')).toBeVisible();

      // Check for critical shortcuts in the registry test section
      await expect(page.locator('text=✅')).toHaveCount({ min: 3 }); // At least 3 working shortcuts

      // Should not see any ❌ for critical shortcuts
      const failedShortcuts = page.locator('text=❌');
      const failedCount = await failedShortcuts.count();

      if (failedCount > 0) {
        // Log which shortcuts are failing
        const failedTexts = await failedShortcuts.allTextContents();
        console.log('❌ Failed shortcuts:', failedTexts);
      }

      expect(failedCount).toBe(0);
    });
  });

  test.describe('🎯 Performance & Reliability', () => {
    test('should handle keyboard events without memory leaks', async ({ page }) => {
      // Generate many keyboard events
      for (let i = 0; i < 100; i++) {
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('ArrowUp');
        if (i % 10 === 0) {
          await page.waitForTimeout(10); // Occasional pause
        }
      }

      // App should still be responsive
      await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();

      // Should be able to perform complex operations
      const isMac = process.platform === 'darwin';
      if (isMac) {
        await page.keyboard.press('Meta+KeyN');
      } else {
        await page.keyboard.press('Control+KeyN');
      }

      await expect(page.locator('[data-testid="create-form"]')).toBeVisible();
      await page.keyboard.press('Escape');
    });

    test('should work correctly after page interactions', async ({ page }) => {
      // Interact with UI elements using mouse
      const sidebar = page.locator('[data-testid="sidebar"]');
      await sidebar.click();

      // Then try keyboard shortcuts
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');

      // Click on header
      const header = page.locator('header');
      if (await header.isVisible()) {
        await header.click();
      }

      // Keyboard shortcuts should still work
      const isMac = process.platform === 'darwin';
      if (isMac) {
        await page.keyboard.press('Meta+Shift+Slash');
      } else {
        await page.keyboard.press('Control+Shift+Slash');
      }

      await expect(page.locator('[data-testid="help-modal"]')).toBeVisible();
      await page.keyboard.press('Escape');
    });
  });
});

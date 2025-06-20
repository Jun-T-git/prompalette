import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { KeyboardProvider, useKeyboard } from '../../providers/KeyboardProvider';
import type { AppStores } from '../../services/AppActionAdapter';

// Test that global shortcuts work from any context
describe('Keyboard Context Fallback Integration', () => {
  let mockStores: AppStores;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStores = {
      promptStore: {
        selectedPromptIndex: 0,
        filteredPrompts: [
          { id: '1', title: 'Test Prompt', content: 'Content' }
        ],
        selectPrompt: vi.fn(),
        navigateUp: vi.fn(),
        navigateDown: vi.fn(),
        selectFirst: vi.fn(),
        selectLast: vi.fn(),
        copySelectedPrompt: vi.fn(),
        deletePrompt: vi.fn(),
      },
      modalStore: {
        openHelp: vi.fn(),
        openSettings: vi.fn(),
        openNewPrompt: vi.fn(),
        openEditPrompt: vi.fn(),
        closeModal: vi.fn(),
      },
      searchStore: {
        focusSearch: vi.fn(),
        clearSearch: vi.fn(),
        hasActiveSearch: vi.fn(() => false),
      },
      formStore: {
        saveForm: vi.fn(),
        cancelForm: vi.fn(),
      },
    };
  });

  const TestContextApp: React.FC = () => {
    const { activeContext, pushContext } = useKeyboard();
    
    return (
      <div>
        <div data-testid="current-context">{activeContext}</div>
        <button onClick={() => pushContext('list')} data-testid="set-list">
          Set List Context
        </button>
        <button onClick={() => pushContext('form')} data-testid="set-form">
          Set Form Context
        </button>
      </div>
    );
  };

  it('should execute global shortcuts from list context', async () => {
    render(
      <KeyboardProvider stores={mockStores}>
        <TestContextApp />
      </KeyboardProvider>
    );

    // Set context to 'list'
    fireEvent.click(screen.getByTestId('set-list'));
    
    // Test global shortcut: Escape (cancel/close)
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => {
      expect(mockStores.modalStore.closeModal).toHaveBeenCalled();
    });

    // Test global shortcut: Cmd+N (new prompt)
    fireEvent.keyDown(document, { key: 'N', metaKey: true });
    await waitFor(() => {
      expect(mockStores.modalStore.openNewPrompt).toHaveBeenCalled();
    });

    // Test global shortcut: Cmd+? (help)
    fireEvent.keyDown(document, { key: '?', metaKey: true });
    await waitFor(() => {
      expect(mockStores.modalStore.openHelp).toHaveBeenCalled();
    });
  });

  it('should execute global shortcuts from form context', async () => {
    render(
      <KeyboardProvider stores={mockStores}>
        <TestContextApp />
      </KeyboardProvider>
    );

    // Set context to 'form'
    fireEvent.click(screen.getByTestId('set-form'));
    
    // Test global shortcut: Escape (cancel/close)
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => {
      expect(mockStores.modalStore.closeModal).toHaveBeenCalled();
    });

    // Test global shortcut: Cmd+? (help)
    fireEvent.keyDown(document, { key: '?', metaKey: true });
    await waitFor(() => {
      expect(mockStores.modalStore.openHelp).toHaveBeenCalled();
    });
  });

  it('should prioritize context-specific shortcuts over global ones', async () => {
    render(
      <KeyboardProvider stores={mockStores}>
        <TestContextApp />
      </KeyboardProvider>
    );

    // Set context to 'list'
    fireEvent.click(screen.getByTestId('set-list'));
    
    // Test list-specific shortcut: ArrowDown (navigation)
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    await waitFor(() => {
      expect(mockStores.promptStore.navigateDown).toHaveBeenCalled();
    });

    // Switch to form context
    fireEvent.click(screen.getByTestId('set-form'));
    vi.clearAllMocks();
    
    // Test form-specific shortcut: Cmd+S (save)
    fireEvent.keyDown(document, { key: 'S', metaKey: true });
    await waitFor(() => {
      expect(mockStores.formStore.saveForm).toHaveBeenCalled();
    });

    // Arrow keys should not work in form context
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(mockStores.promptStore.navigateDown).not.toHaveBeenCalled();
  });

  it('should handle Enter key correctly in different contexts', async () => {
    render(
      <KeyboardProvider stores={mockStores}>
        <TestContextApp />
      </KeyboardProvider>
    );

    // In list context, Enter should copy prompt
    fireEvent.click(screen.getByTestId('set-list'));
    fireEvent.keyDown(document, { key: 'Enter' });
    await waitFor(() => {
      expect(mockStores.promptStore.copySelectedPrompt).toHaveBeenCalled();
    });
  });

  it('should detect when global shortcuts fail in non-global context', async () => {
    // This test specifically checks the bug we found
    const consoleSpy = vi.spyOn(console, 'log');
    
    render(
      <KeyboardProvider stores={mockStores}>
        <TestContextApp />
      </KeyboardProvider>
    );

    // Set context to 'list' (not global)
    fireEvent.click(screen.getByTestId('set-list'));
    
    // Try Escape key
    fireEvent.keyDown(document, { key: 'Escape' });
    
    // Wait for the command to execute
    await waitFor(() => {
      expect(mockStores.modalStore.closeModal).toHaveBeenCalled();
    });

    // Should not see "No shortcut found" message
    const noShortcutLogs = consoleSpy.mock.calls.filter(call => 
      call[0]?.includes?.('No shortcut found')
    );
    expect(noShortcutLogs).toHaveLength(0);

    consoleSpy.mockRestore();
  });
});
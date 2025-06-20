import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { KeyboardProvider, useKeyboard } from '../../providers/KeyboardProvider';
import type { AppStores } from '../../services/AppActionAdapter';

// Mock complete app stores with realistic behavior
const createMockStores = (): AppStores => {
  const prompts = [
    { id: '1', title: 'First Prompt', content: 'Content 1' },
    { id: '2', title: 'Second Prompt', content: 'Content 2' },
    { id: '3', title: 'Third Prompt', content: 'Content 3' },
  ];

  let selectedIndex = 0;
  let searchQuery = '';

  return {
    promptStore: {
      selectedPromptIndex: selectedIndex,
      filteredPrompts: prompts,
      selectPrompt: vi.fn((index: number) => { selectedIndex = index; }),
      navigateUp: vi.fn(() => { 
        selectedIndex = Math.max(0, selectedIndex - 1); 
      }),
      navigateDown: vi.fn(() => { 
        selectedIndex = Math.min(prompts.length - 1, selectedIndex + 1); 
      }),
      selectFirst: vi.fn(() => { selectedIndex = 0; }),
      selectLast: vi.fn(() => { selectedIndex = prompts.length - 1; }),
      copySelectedPrompt: vi.fn().mockResolvedValue(undefined),
      deletePrompt: vi.fn().mockResolvedValue(undefined),
    },
    modalStore: {
      openHelp: vi.fn(() => { isHelpOpen = true; }),
      openSettings: vi.fn(() => { isSettingsOpen = true; }),
      openNewPrompt: vi.fn(() => { isNewPromptOpen = true; }),
      openEditPrompt: vi.fn(),
      closeModal: vi.fn(() => { 
        isHelpOpen = false; 
        isSettingsOpen = false; 
        isNewPromptOpen = false; 
      }),
    },
    searchStore: {
      focusSearch: vi.fn(),
      clearSearch: vi.fn(() => { searchQuery = ''; }),
      hasActiveSearch: vi.fn(() => searchQuery.length > 0),
    },
    formStore: {
      saveForm: vi.fn().mockResolvedValue(undefined),
      cancelForm: vi.fn(),
    },
  };
};

// Comprehensive test app that simulates real usage
const TestApp: React.FC<{ stores: AppStores }> = ({ stores }) => {
  const { activeContext, pushContext, getCompositionProps } = useKeyboard();
  const [currentView, setCurrentView] = React.useState<'list' | 'form' | 'modal'>('list');

  React.useEffect(() => {
    // Simulate context changes based on view
    if (currentView === 'list') {
      pushContext('list');
    } else if (currentView === 'form') {
      pushContext('form');
    }
  }, [currentView, pushContext]);

  const selectedPrompt = stores.promptStore.filteredPrompts[stores.promptStore.selectedPromptIndex];

  return (
    <div data-testid="test-app">
      <div data-testid="current-context">{activeContext}</div>
      <div data-testid="current-view">{currentView}</div>
      
      {/* Search input with IME support */}
      <input 
        {...getCompositionProps()}
        data-testid="search-input"
        placeholder="Search prompts..."
      />
      
      {/* View switcher */}
      <button onClick={() => setCurrentView('list')} data-testid="switch-to-list">
        List View
      </button>
      <button onClick={() => setCurrentView('form')} data-testid="switch-to-form">
        Form View
      </button>
      
      {/* Prompt list */}
      {currentView === 'list' && (
        <div data-testid="prompt-list">
          {stores.promptStore.filteredPrompts.map((prompt, index) => (
            <div 
              key={prompt.id}
              data-testid={`prompt-${index}`}
              className={index === stores.promptStore.selectedPromptIndex ? 'selected' : ''}
            >
              {prompt.title}
            </div>
          ))}
          <div data-testid="selected-prompt">
            {selectedPrompt ? selectedPrompt.title : 'None'}
          </div>
        </div>
      )}
      
      {/* Form view */}
      {currentView === 'form' && (
        <div data-testid="form-view">
          <input data-testid="form-title" placeholder="Title" />
          <textarea data-testid="form-content" placeholder="Content" />
          <button data-testid="save-button">Save</button>
        </div>
      )}
    </div>
  );
};

describe('Keyboard End-to-End Integration', () => {
  let stores: AppStores;

  beforeEach(() => {
    vi.clearAllMocks();
    stores = createMockStores();
  });

  describe('Basic Navigation Flow', () => {
    it('should handle complete navigation workflow', async () => {
      render(
        <KeyboardProvider stores={stores}>
          <TestApp stores={stores} />
        </KeyboardProvider>
      );

      // Initial state
      expect(screen.getByTestId('current-context')).toHaveTextContent('list');
      expect(screen.getByTestId('selected-prompt')).toHaveTextContent('First Prompt');

      // Navigate down
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      await waitFor(() => {
        expect(stores.promptStore.navigateDown).toHaveBeenCalled();
      });

      // Navigate up
      fireEvent.keyDown(document, { key: 'ArrowUp' });
      await waitFor(() => {
        expect(stores.promptStore.navigateUp).toHaveBeenCalled();
      });

      // Go to first
      fireEvent.keyDown(document, { key: 'Home' });
      await waitFor(() => {
        expect(stores.promptStore.selectFirst).toHaveBeenCalled();
      });

      // Go to last
      fireEvent.keyDown(document, { key: 'End' });
      await waitFor(() => {
        expect(stores.promptStore.selectLast).toHaveBeenCalled();
      });
    });

    it('should copy prompt with Enter key', async () => {
      render(
        <KeyboardProvider stores={stores}>
          <TestApp stores={stores} />
        </KeyboardProvider>
      );

      fireEvent.keyDown(document, { key: 'Enter' });
      
      await waitFor(() => {
        expect(stores.promptStore.copySelectedPrompt).toHaveBeenCalled();
      });
    });
  });

  describe('Essential Shortcuts Flow', () => {
    it('should handle all essential shortcuts', async () => {
      render(
        <KeyboardProvider stores={stores}>
          <TestApp stores={stores} />
        </KeyboardProvider>
      );

      // New prompt (Cmd+N)
      fireEvent.keyDown(document, { key: 'N', metaKey: true });
      await waitFor(() => {
        expect(stores.modalStore.openNewPrompt).toHaveBeenCalled();
      });

      // Search focus (Cmd+F)
      fireEvent.keyDown(document, { key: 'F', metaKey: true });
      await waitFor(() => {
        expect(stores.searchStore.focusSearch).toHaveBeenCalled();
      });

      // Help (Cmd+?)
      fireEvent.keyDown(document, { key: '?', metaKey: true });
      await waitFor(() => {
        expect(stores.modalStore.openHelp).toHaveBeenCalled();
      });

      // Settings (Cmd+,)
      fireEvent.keyDown(document, { key: ',', metaKey: true });
      await waitFor(() => {
        expect(stores.modalStore.openSettings).toHaveBeenCalled();
      });

      // Cancel/Close (Escape)
      fireEvent.keyDown(document, { key: 'Escape' });
      await waitFor(() => {
        expect(stores.modalStore.closeModal).toHaveBeenCalled();
      });
    });
  });

  describe('Context Switching', () => {
    it('should handle context-specific shortcuts correctly', async () => {
      render(
        <KeyboardProvider stores={stores}>
          <TestApp stores={stores} />
        </KeyboardProvider>
      );

      // Start in list context
      expect(screen.getByTestId('current-context')).toHaveTextContent('list');

      // Arrow keys should work in list context
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      await waitFor(() => {
        expect(stores.promptStore.navigateDown).toHaveBeenCalled();
      });

      // Switch to form context
      fireEvent.click(screen.getByTestId('switch-to-form'));
      await waitFor(() => {
        expect(screen.getByTestId('current-context')).toHaveTextContent('form');
      });

      // Save shortcut should work in form context
      fireEvent.keyDown(document, { key: 'S', metaKey: true });
      await waitFor(() => {
        expect(stores.formStore.saveForm).toHaveBeenCalled();
      });

      // Arrow keys should not work in form context (different behavior)
      vi.clearAllMocks();
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      
      // Navigation should not be called in form context
      expect(stores.promptStore.navigateDown).not.toHaveBeenCalled();
    });
  });

  describe('IME Composition Handling', () => {
    it('should block shortcuts during IME composition', async () => {
      render(
        <KeyboardProvider stores={stores}>
          <TestApp stores={stores} />
        </KeyboardProvider>
      );

      const searchInput = screen.getByTestId('search-input');

      // Start composition
      fireEvent.compositionStart(searchInput, { data: '' });

      // Try shortcuts during composition - should be blocked
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      fireEvent.keyDown(document, { key: 'N', metaKey: true });

      expect(stores.promptStore.navigateDown).not.toHaveBeenCalled();
      expect(stores.modalStore.openNewPrompt).not.toHaveBeenCalled();

      // End composition
      fireEvent.compositionEnd(searchInput, { data: 'こんにちは' });

      // Shortcuts should work again after grace period
      await new Promise(resolve => setTimeout(resolve, 200));

      fireEvent.keyDown(document, { key: 'ArrowDown' });
      await waitFor(() => {
        expect(stores.promptStore.navigateDown).toHaveBeenCalled();
      });
    });
  });

  describe('Input Element Behavior', () => {
    it('should handle shortcuts correctly in input elements', async () => {
      render(
        <KeyboardProvider stores={stores}>
          <TestApp stores={stores} />
        </KeyboardProvider>
      );

      const searchInput = screen.getByTestId('search-input');
      searchInput.focus();

      // Essential shortcuts should work in input elements
      fireEvent.keyDown(searchInput, { key: 'F', metaKey: true });
      await waitFor(() => {
        expect(stores.searchStore.focusSearch).toHaveBeenCalled();
      });

      // Non-essential shortcuts should be blocked in input elements
      fireEvent.keyDown(searchInput, { key: 'N', metaKey: true });
      expect(stores.modalStore.openNewPrompt).not.toHaveBeenCalled();
    });
  });

  describe('Complex User Workflows', () => {
    it('should handle realistic user interaction patterns', async () => {
      render(
        <KeyboardProvider stores={stores}>
          <TestApp stores={stores} />
        </KeyboardProvider>
      );

      // 1. User searches for prompts
      fireEvent.keyDown(document, { key: 'F', metaKey: true });
      await waitFor(() => {
        expect(stores.searchStore.focusSearch).toHaveBeenCalled();
      });

      // 2. User navigates through results
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      await waitFor(() => {
        expect(stores.promptStore.navigateDown).toHaveBeenCalledTimes(2);
      });

      // 3. User copies selected prompt
      fireEvent.keyDown(document, { key: 'Enter' });
      await waitFor(() => {
        expect(stores.promptStore.copySelectedPrompt).toHaveBeenCalled();
      });

      // 4. User creates new prompt
      fireEvent.keyDown(document, { key: 'N', metaKey: true });
      await waitFor(() => {
        expect(stores.modalStore.openNewPrompt).toHaveBeenCalled();
      });

      // 5. User switches to form and saves
      fireEvent.click(screen.getByTestId('switch-to-form'));
      fireEvent.keyDown(document, { key: 'S', metaKey: true });
      await waitFor(() => {
        expect(stores.formStore.saveForm).toHaveBeenCalled();
      });

      // 6. User cancels and returns to list
      fireEvent.keyDown(document, { key: 'Escape' });
      await waitFor(() => {
        expect(stores.modalStore.closeModal).toHaveBeenCalled();
      });
    });
  });

  describe('Error Resilience', () => {
    it('should continue working after store errors', async () => {
      // Make one store method fail
      stores.promptStore.navigateDown = vi.fn().mockRejectedValue(new Error('Navigation failed'));

      render(
        <KeyboardProvider stores={stores}>
          <TestApp stores={stores} />
        </KeyboardProvider>
      );

      // Failing operation
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      
      // Other operations should still work
      fireEvent.keyDown(document, { key: 'N', metaKey: true });
      await waitFor(() => {
        expect(stores.modalStore.openNewPrompt).toHaveBeenCalled();
      });

      fireEvent.keyDown(document, { key: 'F', metaKey: true });
      await waitFor(() => {
        expect(stores.searchStore.focusSearch).toHaveBeenCalled();
      });
    });
  });
});
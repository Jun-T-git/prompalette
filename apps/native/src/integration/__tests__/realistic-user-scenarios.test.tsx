import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { KeyboardProvider, useKeyboard } from '../../providers/KeyboardProvider';
import type { AppStores } from '../../services/AppActionAdapter';

/**
 * Realistic User Scenario Tests
 * These simulate actual user behavior patterns and edge cases
 */
describe('🎬 Realistic User Scenarios', () => {
  let stores: AppStores;

  beforeEach(() => {
    vi.clearAllMocks();
    
    stores = {
      promptStore: {
        selectedPromptIndex: 0,
        filteredPrompts: [
          { id: '1', title: 'Daily Standup', content: 'What did you work on yesterday?' },
          { id: '2', title: 'Code Review', content: 'Please review this PR' },
          { id: '3', title: 'Meeting Notes', content: 'Action items from today' },
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

  // Simulate realistic app with proper state management
  const RealisticApp: React.FC = () => {
    const [appState, setAppState] = React.useState({
      showHelpModal: false,
      showCreateForm: false,
      showEditForm: false,
      showSettings: false,
      isLoading: false,
    });
    
    const { pushContext, activeContext } = useKeyboard();

    // Real context switching logic from App.tsx
    React.useEffect(() => {
      if (!appState.showCreateForm && !appState.showEditForm && !appState.showHelpModal && !appState.showSettings) {
        pushContext('list');
      } else if (appState.showCreateForm || appState.showEditForm) {
        pushContext('form');
      } else {
        pushContext('modal');
      }
    }, [appState.showCreateForm, appState.showEditForm, appState.showHelpModal, appState.showSettings, pushContext]);

    // Wire up modal actions to state changes
    React.useEffect(() => {
      stores.modalStore.openHelp = vi.fn(() => {
        setAppState(prev => ({ ...prev, showHelpModal: true }));
      });
      stores.modalStore.openNewPrompt = vi.fn(() => {
        setAppState(prev => ({ ...prev, showCreateForm: true }));
      });
      stores.modalStore.openSettings = vi.fn(() => {
        setAppState(prev => ({ ...prev, showSettings: true }));
      });
      stores.modalStore.closeModal = vi.fn(() => {
        setAppState(prev => ({ 
          ...prev, 
          showHelpModal: false,
          showCreateForm: false,
          showEditForm: false,
          showSettings: false 
        }));
      });
    }, []);

    return (
      <div data-testid="realistic-app">
        <div data-testid="context-indicator">Context: {activeContext}</div>
        
        {/* App state indicators */}
        <div data-testid="app-state">
          {appState.showHelpModal && <div data-testid="help-modal">Help Modal Open</div>}
          {appState.showCreateForm && <div data-testid="create-form">Create Form Open</div>}
          {appState.showEditForm && <div data-testid="edit-form">Edit Form Open</div>}
          {appState.showSettings && <div data-testid="settings">Settings Open</div>}
        </div>

        {/* Prompt list (only in list context) */}
        {activeContext === 'list' && (
          <div data-testid="prompt-list">
            {stores.promptStore.filteredPrompts.map((prompt, index) => (
              <div key={prompt.id} data-testid={`prompt-${index}`}>
                {prompt.title}
              </div>
            ))}
          </div>
        )}

        {/* Form inputs (only in form context) */}
        {activeContext === 'form' && (
          <div data-testid="form-inputs">
            <input data-testid="title-input" placeholder="Title" />
            <textarea data-testid="content-input" placeholder="Content" />
          </div>
        )}
      </div>
    );
  };

  describe('🎯 Real User Flow: Quick Prompt Access', () => {
    it('should handle: open app → navigate → copy → close workflow', async () => {
      render(
        <KeyboardProvider stores={stores}>
          <RealisticApp />
        </KeyboardProvider>
      );

      // 1. User opens app, sees list
      await waitFor(() => {
        expect(screen.getByTestId('context-indicator')).toHaveTextContent('list');
      });
      expect(screen.getByTestId('prompt-list')).toBeInTheDocument();

      // 2. User navigates down to find right prompt
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      fireEvent.keyDown(document, { key: 'ArrowDown' });

      await waitFor(() => {
        expect(stores.promptStore.navigateDown).toHaveBeenCalledTimes(2);
      });

      // 3. User presses Enter to copy
      fireEvent.keyDown(document, { key: 'Enter' });

      await waitFor(() => {
        expect(stores.promptStore.copySelectedPrompt).toHaveBeenCalled();
      });

      // 4. User might press Escape to clear search or close (should work in list context)
      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(stores.modalStore.closeModal).toHaveBeenCalled();
      });
    });
  });

  describe('🎯 Real User Flow: Help → Browse → Create New', () => {
    it('should handle: help → close → navigate → create workflow', async () => {
      render(
        <KeyboardProvider stores={stores}>
          <RealisticApp />
        </KeyboardProvider>
      );

      // 1. User presses ? for help (from list)
      expect(screen.getByTestId('context-indicator')).toHaveTextContent('list');
      
      fireEvent.keyDown(document, { key: '?', metaKey: true });

      await waitFor(() => {
        expect(screen.getByTestId('help-modal')).toBeInTheDocument();
        expect(screen.getByTestId('context-indicator')).toHaveTextContent('modal');
      });

      // 2. User closes help with Escape
      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByTestId('help-modal')).not.toBeInTheDocument();
        expect(screen.getByTestId('context-indicator')).toHaveTextContent('list');
      });

      // 3. User browses with arrows
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      expect(stores.promptStore.navigateDown).toHaveBeenCalled();

      // 4. User decides to create new prompt
      fireEvent.keyDown(document, { key: 'N', metaKey: true });

      await waitFor(() => {
        expect(screen.getByTestId('create-form')).toBeInTheDocument();
        expect(screen.getByTestId('context-indicator')).toHaveTextContent('form');
      });

      // 5. User cancels form with Escape
      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByTestId('create-form')).not.toBeInTheDocument();
        expect(screen.getByTestId('context-indicator')).toHaveTextContent('list');
      });
    });
  });

  describe('🎯 Real User Flow: Input Field Edge Cases', () => {
    it('should handle keyboard shortcuts when typing in form inputs', async () => {
      render(
        <KeyboardProvider stores={stores}>
          <RealisticApp />
        </KeyboardProvider>
      );

      // Open create form
      fireEvent.keyDown(document, { key: 'N', metaKey: true });
      
      await waitFor(() => {
        expect(screen.getByTestId('create-form')).toBeInTheDocument();
        expect(screen.getByTestId('context-indicator')).toHaveTextContent('form');
      });

      // Focus in title input and type
      const titleInput = screen.getByTestId('title-input');
      titleInput.focus();

      // Essential shortcuts should still work in input
      fireEvent.keyDown(titleInput, { key: '?', metaKey: true });
      await waitFor(() => {
        expect(stores.modalStore.openHelp).toHaveBeenCalled();
      });

      // But navigation shortcuts should not work in input
      vi.clearAllMocks();
      fireEvent.keyDown(titleInput, { key: 'ArrowDown' });
      expect(stores.promptStore.navigateDown).not.toHaveBeenCalled();

      // Escape should still work to close form
      fireEvent.keyDown(titleInput, { key: 'Escape' });
      await waitFor(() => {
        expect(stores.modalStore.closeModal).toHaveBeenCalled();
      });
    });
  });

  describe('🎯 Real User Flow: Rapid Context Switching', () => {
    it('should handle rapid modal opening/closing without breaking', async () => {
      render(
        <KeyboardProvider stores={stores}>
          <RealisticApp />
        </KeyboardProvider>
      );

      // Rapid fire modal operations (real users do this)
      const operations = [
        () => fireEvent.keyDown(document, { key: '?', metaKey: true }), // help
        () => fireEvent.keyDown(document, { key: 'Escape' }), // close
        () => fireEvent.keyDown(document, { key: 'N', metaKey: true }), // new
        () => fireEvent.keyDown(document, { key: 'Escape' }), // close
        () => fireEvent.keyDown(document, { key: 'ArrowDown' }), // navigate
        () => fireEvent.keyDown(document, { key: 'Enter' }), // copy
      ];

      // Execute rapidly
      for (const operation of operations) {
        operation();
        await new Promise(resolve => setTimeout(resolve, 50)); // Small delay
      }

      // Should end in list context
      await waitFor(() => {
        expect(screen.getByTestId('context-indicator')).toHaveTextContent('list');
      });

      // All operations should have been executed
      expect(stores.modalStore.openHelp).toHaveBeenCalled();
      expect(stores.modalStore.openNewPrompt).toHaveBeenCalled();
      expect(stores.modalStore.closeModal).toHaveBeenCalled();
      expect(stores.promptStore.navigateDown).toHaveBeenCalled();
      expect(stores.promptStore.copySelectedPrompt).toHaveBeenCalled();
    });
  });

  describe('🎯 Real User Flow: Error Recovery', () => {
    it('should recover gracefully when store actions fail', async () => {
      // Make some store actions fail
      stores.promptStore.navigateDown = vi.fn().mockRejectedValue(new Error('Navigation failed'));
      stores.modalStore.openHelp = vi.fn().mockRejectedValue(new Error('Help failed'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <KeyboardProvider stores={stores}>
          <RealisticApp />
        </KeyboardProvider>
      );

      // Try failing operations
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      fireEvent.keyDown(document, { key: '?', metaKey: true });

      // Wait for any async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should still be functional
      fireEvent.keyDown(document, { key: 'N', metaKey: true });
      
      await waitFor(() => {
        expect(stores.modalStore.openNewPrompt).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('🎯 Performance: Ensure No Memory Leaks', () => {
    it('should properly cleanup event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      const { unmount } = render(
        <KeyboardProvider stores={stores}>
          <RealisticApp />
        </KeyboardProvider>
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
    });
  });
});
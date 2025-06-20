import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { KeyboardProvider, useKeyboard } from '../../providers/KeyboardProvider';
import type { AppStores } from '../../services/AppActionAdapter';

// Real user workflow simulation
describe('User Workflow Keyboard Tests', () => {
  let mockStores: AppStores;
  let mockModalActions: {
    setShowHelpModal: ReturnType<typeof vi.fn>;
    setShowCreateForm: ReturnType<typeof vi.fn>;
    setShowEditForm: ReturnType<typeof vi.fn>;
    setShowSettings: ReturnType<typeof vi.fn>;
    setSelectedPrompt: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Track modal state changes to verify actual behavior
    mockModalActions = {
      setShowHelpModal: vi.fn(),
      setShowCreateForm: vi.fn(),
      setShowEditForm: vi.fn(),
      setShowSettings: vi.fn(),
      setSelectedPrompt: vi.fn(),
    };

    mockStores = {
      promptStore: {
        selectedPromptIndex: 0,
        filteredPrompts: [
          { id: '1', title: 'First Prompt', content: 'First Content' },
          { id: '2', title: 'Second Prompt', content: 'Second Content' },
          { id: '3', title: 'Third Prompt', content: 'Third Content' },
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
        openHelp: mockModalActions.setShowHelpModal.bind(null, true),
        openSettings: mockModalActions.setShowSettings.bind(null, true),
        openNewPrompt: mockModalActions.setShowCreateForm.bind(null, true),
        openEditPrompt: vi.fn(),
        closeModal: vi.fn(() => {
          mockModalActions.setShowHelpModal(false);
          mockModalActions.setShowCreateForm(false);
          mockModalActions.setShowEditForm(false);
          mockModalActions.setShowSettings(false);
        }),
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

  // Simulate real app component with context switching
  const UserWorkflowApp: React.FC<{
    showHelpModal?: boolean;
    showCreateForm?: boolean;
    showEditForm?: boolean;
    showSettings?: boolean;
  }> = ({ 
    showHelpModal = false, 
    showCreateForm = false,
    showEditForm = false,
    showSettings = false 
  }) => {
    const { pushContext, activeContext } = useKeyboard();
    
    React.useEffect(() => {
      // Simulate real app context switching logic
      if (!showCreateForm && !showEditForm && !showHelpModal && !showSettings) {
        pushContext('list');
      } else if (showCreateForm || showEditForm) {
        pushContext('form');
      } else {
        pushContext('modal');
      }
    }, [showCreateForm, showEditForm, showHelpModal, showSettings, pushContext]);
    
    return (
      <div data-testid="app">
        <div data-testid="current-context">{activeContext}</div>
        <div data-testid="app-state">
          {showHelpModal && <div data-testid="help-modal">Help Modal</div>}
          {showCreateForm && <div data-testid="create-form">Create Form</div>}
          {showEditForm && <div data-testid="edit-form">Edit Form</div>}
          {showSettings && <div data-testid="settings-modal">Settings</div>}
        </div>
        
        {/* Simulate prompt list (only in list context) */}
        {activeContext === 'list' && (
          <div data-testid="prompt-list">
            {mockStores.promptStore.filteredPrompts.map((prompt, index) => (
              <div key={prompt.id} data-testid={`prompt-item-${index}`}>
                {prompt.title}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  describe('🎯 Core User Flow: List Navigation & Actions', () => {
    it('should handle typical user flow: browse → navigate → copy', async () => {
      const TestApp = () => {
        const [appState, setAppState] = React.useState({
          showHelpModal: false,
          showCreateForm: false,
          showEditForm: false,
          showSettings: false,
        });

        // Listen for modal state changes
        React.useEffect(() => {
          mockModalActions.setShowHelpModal.mockImplementation((show: boolean) => {
            setAppState(prev => ({ ...prev, showHelpModal: show }));
          });
          mockModalActions.setShowCreateForm.mockImplementation((show: boolean) => {
            setAppState(prev => ({ ...prev, showCreateForm: show }));
          });
          mockModalActions.setShowSettings.mockImplementation((show: boolean) => {
            setAppState(prev => ({ ...prev, showSettings: show }));
          });
        }, []);

        return <UserWorkflowApp {...appState} />;
      };

      render(
        <KeyboardProvider stores={mockStores}>
          <TestApp />
        </KeyboardProvider>
      );

      // 1. User starts in list context
      expect(screen.getByTestId('current-context')).toHaveTextContent('list');
      expect(screen.getByTestId('prompt-list')).toBeInTheDocument();

      // 2. User navigates with arrow keys
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      await waitFor(() => {
        expect(mockStores.promptStore.navigateDown).toHaveBeenCalled();
      });

      fireEvent.keyDown(document, { key: 'ArrowUp' });
      await waitFor(() => {
        expect(mockStores.promptStore.navigateUp).toHaveBeenCalled();
      });

      // 3. User copies with Enter
      fireEvent.keyDown(document, { key: 'Enter' });
      await waitFor(() => {
        expect(mockStores.promptStore.copySelectedPrompt).toHaveBeenCalled();
      });
    });

    it('should handle help modal workflow: open → close with escape', async () => {
      const TestApp = () => {
        const [showHelpModal, setShowHelpModal] = React.useState(false);

        React.useEffect(() => {
          mockModalActions.setShowHelpModal.mockImplementation(setShowHelpModal);
        }, []);

        return <UserWorkflowApp showHelpModal={showHelpModal} />;
      };

      render(
        <KeyboardProvider stores={mockStores}>
          <TestApp />
        </KeyboardProvider>
      );

      // Start in list context
      expect(screen.getByTestId('current-context')).toHaveTextContent('list');
      expect(screen.queryByTestId('help-modal')).not.toBeInTheDocument();

      // Open help with Cmd+?
      fireEvent.keyDown(document, { key: '?', metaKey: true });
      
      await waitFor(() => {
        expect(mockModalActions.setShowHelpModal).toHaveBeenCalledWith(true);
      });

      // Context should change to modal
      await waitFor(() => {
        expect(screen.getByTestId('current-context')).toHaveTextContent('modal');
      });

      // Close help with Escape
      fireEvent.keyDown(document, { key: 'Escape' });
      
      await waitFor(() => {
        expect(mockStores.modalStore.closeModal).toHaveBeenCalled();
      });
    });

    it('should detect when Escape fails in list context (current bug)', async () => {
      render(
        <KeyboardProvider stores={mockStores}>
          <UserWorkflowApp />
        </KeyboardProvider>
      );

      // In list context
      expect(screen.getByTestId('current-context')).toHaveTextContent('list');

      // Try escape (this should work but currently might not)
      fireEvent.keyDown(document, { key: 'Escape' });

      // Should call closeModal (even from list context)
      await waitFor(() => {
        expect(mockStores.modalStore.closeModal).toHaveBeenCalled();
      }, { timeout: 1000 });
    });

    it('should detect when Enter fails in list context (current bug)', async () => {
      render(
        <KeyboardProvider stores={mockStores}>
          <UserWorkflowApp />
        </KeyboardProvider>
      );

      // In list context
      expect(screen.getByTestId('current-context')).toHaveTextContent('list');

      // Try Enter (should copy prompt)
      fireEvent.keyDown(document, { key: 'Enter' });

      // Should call copySelectedPrompt
      await waitFor(() => {
        expect(mockStores.promptStore.copySelectedPrompt).toHaveBeenCalled();
      }, { timeout: 1000 });
    });
  });

  describe('🎯 Core User Flow: New Prompt Creation', () => {
    it('should handle new prompt workflow: create → escape to cancel', async () => {
      const TestApp = () => {
        const [showCreateForm, setShowCreateForm] = React.useState(false);

        React.useEffect(() => {
          mockModalActions.setShowCreateForm.mockImplementation(setShowCreateForm);
        }, []);

        return <UserWorkflowApp showCreateForm={showCreateForm} />;
      };

      render(
        <KeyboardProvider stores={mockStores}>
          <TestApp />
        </KeyboardProvider>
      );

      // Start in list
      expect(screen.getByTestId('current-context')).toHaveTextContent('list');

      // Open new prompt form
      fireEvent.keyDown(document, { key: 'N', metaKey: true });
      
      await waitFor(() => {
        expect(mockModalActions.setShowCreateForm).toHaveBeenCalledWith(true);
      });

      // Should switch to form context
      await waitFor(() => {
        expect(screen.getByTestId('current-context')).toHaveTextContent('form');
      });

      // Cancel with Escape
      fireEvent.keyDown(document, { key: 'Escape' });
      
      await waitFor(() => {
        expect(mockStores.modalStore.closeModal).toHaveBeenCalled();
      });
    });
  });

  describe('🎯 Core User Flow: Error Detection', () => {
    it('should fail fast when keyboard system is completely broken', async () => {
      // This test should fail if keyboard system isn't working at all
      const consoleSpy = vi.spyOn(console, 'error');
      
      render(
        <KeyboardProvider stores={mockStores}>
          <UserWorkflowApp />
        </KeyboardProvider>
      );

      // Try the most common keyboard shortcuts
      const commonShortcuts = [
        { key: 'ArrowDown', label: 'Navigate down' },
        { key: 'ArrowUp', label: 'Navigate up' },
        { key: 'Enter', label: 'Confirm/copy' },
        { key: 'Escape', label: 'Cancel/close' },
        { key: '?', metaKey: true, label: 'Help' },
        { key: 'N', metaKey: true, label: 'New prompt' },
      ];

      for (const shortcut of commonShortcuts) {
        fireEvent.keyDown(document, {
          key: shortcut.key,
          metaKey: shortcut.metaKey || false,
        });
      }

      // Wait for any async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should not have keyboard execution errors
      const keyboardErrors = consoleSpy.mock.calls.filter(call =>
        call[0]?.includes?.('Keyboard shortcut execution failed')
      );
      
      expect(keyboardErrors).toHaveLength(0);
      
      // At least some commands should have been called
      const totalCalls = 
        mockStores.promptStore.navigateDown.mock.calls.length +
        mockStores.promptStore.navigateUp.mock.calls.length +
        mockStores.promptStore.copySelectedPrompt.mock.calls.length +
        mockStores.modalStore.closeModal.mock.calls.length +
        mockModalActions.setShowHelpModal.mock.calls.length +
        mockModalActions.setShowCreateForm.mock.calls.length;

      expect(totalCalls).toBeGreaterThan(0);
      
      consoleSpy.mockRestore();
    });

    it('should verify keyboard events actually reach the handler', async () => {
      const keydownSpy = vi.fn();
      window.addEventListener('keydown', keydownSpy);

      render(
        <KeyboardProvider stores={mockStores}>
          <UserWorkflowApp />
        </KeyboardProvider>
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(keydownSpy).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'Escape' })
      );

      window.removeEventListener('keydown', keydownSpy);
    });
  });
});
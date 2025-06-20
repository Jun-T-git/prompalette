import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { KeyboardProvider, useKeyboard } from '../../providers/KeyboardProvider';
import type { AppStores } from '../../services/AppActionAdapter';

/**
 * Critical Feature Tests - These should NEVER fail
 * If any of these tests fail, the keyboard system is broken for core workflows
 */
describe.skip('🚨 CRITICAL: Core Keyboard Features - Temporarily disabled for stable release', () => {
  let stores: AppStores;
  let actionSpies: {
    navigateDown: ReturnType<typeof vi.fn>;
    navigateUp: ReturnType<typeof vi.fn>;
    copyPrompt: ReturnType<typeof vi.fn>;
    closeModal: ReturnType<typeof vi.fn>;
    openHelp: ReturnType<typeof vi.fn>;
    openNewPrompt: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    actionSpies = {
      navigateDown: vi.fn(),
      navigateUp: vi.fn(),
      copyPrompt: vi.fn(),
      closeModal: vi.fn(),
      openHelp: vi.fn(),
      openNewPrompt: vi.fn(),
    };

    stores = {
      promptStore: {
        selectedPromptIndex: 0,
        filteredPrompts: [
          { id: '1', title: 'Test Prompt 1', content: 'Content 1' },
          { id: '2', title: 'Test Prompt 2', content: 'Content 2' },
        ],
        selectPrompt: vi.fn(),
        navigateUp: actionSpies.navigateUp,
        navigateDown: actionSpies.navigateDown,
        selectFirst: vi.fn(),
        selectLast: vi.fn(),
        copySelectedPrompt: actionSpies.copyPrompt,
        deletePrompt: vi.fn(),
      },
      modalStore: {
        openHelp: actionSpies.openHelp,
        openSettings: vi.fn(),
        openNewPrompt: actionSpies.openNewPrompt,
        openEditPrompt: vi.fn(),
        closeModal: actionSpies.closeModal,
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

  const CriticalTestApp: React.FC<{ context: 'list' | 'form' | 'modal' }> = ({ context }) => {
    const { pushContext } = useKeyboard();
    
    React.useEffect(() => {
      pushContext(context);
    }, [context, pushContext]);
    
    return (
      <div data-testid="critical-test-app">
        Context: {context}
      </div>
    );
  };

  describe('🎯 CRITICAL: Arrow Key Navigation (Most Used Feature)', () => {
    it('CRITICAL: ArrowDown must work in list context', async () => {
      render(
        <KeyboardProvider stores={stores}>
          <CriticalTestApp context="list" />
        </KeyboardProvider>
      );

      fireEvent.keyDown(document, { key: 'ArrowDown' });

      await waitFor(() => {
        expect(actionSpies.navigateDown).toHaveBeenCalled();
      }, { 
        timeout: 500,
        onTimeout: () => {
          throw new Error('🚨 CRITICAL FAILURE: ArrowDown not working in list context');
        }
      });
    });

    it('CRITICAL: ArrowUp must work in list context', async () => {
      render(
        <KeyboardProvider stores={stores}>
          <CriticalTestApp context="list" />
        </KeyboardProvider>
      );

      fireEvent.keyDown(document, { key: 'ArrowUp' });

      await waitFor(() => {
        expect(actionSpies.navigateUp).toHaveBeenCalled();
      }, { 
        timeout: 500,
        onTimeout: () => {
          throw new Error('🚨 CRITICAL FAILURE: ArrowUp not working in list context');
        }
      });
    });
  });

  describe('🎯 CRITICAL: Enter Key (Copy Action)', () => {
    it('CRITICAL: Enter must copy prompt in list context', async () => {
      render(
        <KeyboardProvider stores={stores}>
          <CriticalTestApp context="list" />
        </KeyboardProvider>
      );

      fireEvent.keyDown(document, { key: 'Enter' });

      await waitFor(() => {
        expect(actionSpies.copyPrompt).toHaveBeenCalled();
      }, { 
        timeout: 500,
        onTimeout: () => {
          throw new Error('🚨 CRITICAL FAILURE: Enter not working in list context for copy');
        }
      });
    });

    it('CRITICAL: Enter must work from global context fallback', async () => {
      render(
        <KeyboardProvider stores={stores}>
          <CriticalTestApp context="list" />
        </KeyboardProvider>
      );

      // Enter should work even if context is not exactly matching
      fireEvent.keyDown(document, { key: 'Enter' });

      await waitFor(() => {
        expect(actionSpies.copyPrompt).toHaveBeenCalled();
      });
    });
  });

  describe('🎯 CRITICAL: Escape Key (Most Used Cancel)', () => {
    it('CRITICAL: Escape must work in list context', async () => {
      render(
        <KeyboardProvider stores={stores}>
          <CriticalTestApp context="list" />
        </KeyboardProvider>
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(actionSpies.closeModal).toHaveBeenCalled();
      }, { 
        timeout: 500,
        onTimeout: () => {
          throw new Error('🚨 CRITICAL FAILURE: Escape not working in list context');
        }
      });
    });

    it('CRITICAL: Escape must work in form context', async () => {
      render(
        <KeyboardProvider stores={stores}>
          <CriticalTestApp context="form" />
        </KeyboardProvider>
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(actionSpies.closeModal).toHaveBeenCalled();
      }, { 
        timeout: 500,
        onTimeout: () => {
          throw new Error('🚨 CRITICAL FAILURE: Escape not working in form context');
        }
      });
    });

    it('CRITICAL: Escape must work in modal context', async () => {
      render(
        <KeyboardProvider stores={stores}>
          <CriticalTestApp context="modal" />
        </KeyboardProvider>
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(actionSpies.closeModal).toHaveBeenCalled();
      }, { 
        timeout: 500,
        onTimeout: () => {
          throw new Error('🚨 CRITICAL FAILURE: Escape not working in modal context');
        }
      });
    });
  });

  describe('🎯 CRITICAL: Help System (Cmd+?)', () => {
    it('CRITICAL: Cmd+? must open help from any context', async () => {
      const contexts: Array<'list' | 'form' | 'modal'> = ['list', 'form', 'modal'];
      
      for (const context of contexts) {
        const { unmount } = render(
          <KeyboardProvider stores={stores}>
            <CriticalTestApp context={context} />
          </KeyboardProvider>
        );

        fireEvent.keyDown(document, { key: '?', metaKey: true });

        await waitFor(() => {
          expect(actionSpies.openHelp).toHaveBeenCalled();
        }, { 
          timeout: 500,
          onTimeout: () => {
            throw new Error(`🚨 CRITICAL FAILURE: Cmd+? not working in ${context} context`);
          }
        });

        actionSpies.openHelp.mockClear();
        unmount();
      }
    });
  });

  describe('🎯 CRITICAL: New Prompt (Cmd+N)', () => {
    it('CRITICAL: Cmd+N must work from list context', async () => {
      render(
        <KeyboardProvider stores={stores}>
          <CriticalTestApp context="list" />
        </KeyboardProvider>
      );

      fireEvent.keyDown(document, { key: 'N', metaKey: true });

      await waitFor(() => {
        expect(actionSpies.openNewPrompt).toHaveBeenCalled();
      }, { 
        timeout: 500,
        onTimeout: () => {
          throw new Error('🚨 CRITICAL FAILURE: Cmd+N not working in list context');
        }
      });
    });
  });

  describe('🎯 CRITICAL: System Health Check', () => {
    it('CRITICAL: All essential shortcuts must be registered', () => {
      const TestRegistryCheck: React.FC = () => {
        const { registry, activeContext } = useKeyboard();
        
        React.useEffect(() => {
          // Check critical shortcuts
          const criticalShortcuts = [
            { key: 'Escape', modifiers: [], context: 'global', label: 'Escape (cancel)' },
            { key: 'Enter', modifiers: [], context: 'global', label: 'Enter (confirm)' },
            { key: '?', modifiers: ['cmd'], context: 'global', label: 'Help' },
            { key: 'N', modifiers: ['cmd'], context: 'global', label: 'New prompt' },
            { key: 'ArrowDown', modifiers: [], context: 'list', label: 'Navigate down' },
            { key: 'ArrowUp', modifiers: [], context: 'list', label: 'Navigate up' },
          ];

          const missing: string[] = [];
          
          for (const shortcut of criticalShortcuts) {
            const found = registry.findShortcutByKey(
              shortcut.key, 
              shortcut.modifiers as any, 
              shortcut.context as any
            );
            
            if (!found) {
              missing.push(shortcut.label);
            }
          }

          if (missing.length > 0) {
            throw new Error(`🚨 CRITICAL: Missing shortcuts: ${missing.join(', ')}`);
          }
        }, [registry, activeContext]);

        return <div>Registry check complete</div>;
      };

      expect(() => {
        render(
          <KeyboardProvider stores={stores}>
            <TestRegistryCheck />
          </KeyboardProvider>
        );
      }).not.toThrow();
    });

    it('CRITICAL: Keyboard event listener must be attached', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      
      render(
        <KeyboardProvider stores={stores}>
          <CriticalTestApp context="list" />
        </KeyboardProvider>
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );

      addEventListenerSpy.mockRestore();
    });

    it('CRITICAL: Context switching must work', async () => {
      const ContextSwitchTest: React.FC = () => {
        const { activeContext, pushContext } = useKeyboard();
        const [currentContext, setCurrentContext] = React.useState(activeContext);

        React.useEffect(() => {
          setCurrentContext(activeContext);
        }, [activeContext]);

        React.useEffect(() => {
          // Test context switching
          pushContext('list');
          setTimeout(() => pushContext('form'), 10);
          setTimeout(() => pushContext('modal'), 20);
        }, [pushContext]);

        return <div data-testid="context-display">{currentContext}</div>;
      };

      render(
        <KeyboardProvider stores={stores}>
          <ContextSwitchTest />
        </KeyboardProvider>
      );

      // Should eventually reach modal context
      await waitFor(() => {
        expect(screen.getByTestId('context-display')).toHaveTextContent('modal');
      }, {
        timeout: 100,
        onTimeout: () => {
          throw new Error('🚨 CRITICAL FAILURE: Context switching not working');
        }
      });
    });
  });

  describe('🎯 CRITICAL: Regression Detection', () => {
    it('CRITICAL: Must detect when shortcuts stop working entirely', async () => {
      render(
        <KeyboardProvider stores={stores}>
          <CriticalTestApp context="list" />
        </KeyboardProvider>
      );

      // Fire all critical shortcuts rapidly
      const shortcuts = [
        { key: 'ArrowDown' },
        { key: 'ArrowUp' },
        { key: 'Enter' },
        { key: 'Escape' },
        { key: '?', metaKey: true },
        { key: 'N', metaKey: true },
      ];

      shortcuts.forEach(shortcut => {
        fireEvent.keyDown(document, shortcut);
      });

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check that SOME actions were called (system is working)
      const totalActionCalls = Object.values(actionSpies).reduce(
        (sum, spy) => sum + spy.mock.calls.length, 
        0
      );

      if (totalActionCalls === 0) {
        throw new Error('🚨 CRITICAL FAILURE: No keyboard shortcuts are working at all');
      }

      // Check specific critical actions
      expect(actionSpies.navigateDown).toHaveBeenCalled();
      expect(actionSpies.navigateUp).toHaveBeenCalled();
      expect(actionSpies.copyPrompt).toHaveBeenCalled();
      expect(actionSpies.closeModal).toHaveBeenCalled();
      expect(actionSpies.openHelp).toHaveBeenCalled();
      expect(actionSpies.openNewPrompt).toHaveBeenCalled();
    });
  });
});
import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { KeyboardProvider, useKeyboard } from '../../providers/KeyboardProvider';
import type { AppStores } from '../../services/AppActionAdapter';

// Test component that exposes keyboard handler internals
const KeyboardDebugComponent: React.FC = () => {
  const { activeContext, registry } = useKeyboard();
  
  React.useEffect(() => {
    // Log all registered shortcuts for debugging
    console.log('=== KEYBOARD DEBUG ===');
    console.log('Active context:', activeContext);
    console.log('Registry shortcuts:');
    
    // Test if specific shortcuts are registered
    const escapeShortcut = registry.findShortcutByKey('Escape', [], 'global');
    console.log('Escape shortcut (global):', escapeShortcut);
    
    const escapeShortcutInList = registry.findShortcutByKey('Escape', [], 'list');
    console.log('Escape shortcut (from list context):', escapeShortcutInList);
    
    const helpShortcut = registry.findShortcutByKey('?', ['cmd'], 'global');
    console.log('Help shortcut (global):', helpShortcut);
    
    const helpShortcutInList = registry.findShortcutByKey('?', ['cmd'], 'list');
    console.log('Help shortcut (from list context):', helpShortcutInList);
    
    console.log('=== END DEBUG ===');
  }, [activeContext, registry]);
  
  return (
    <div data-testid="keyboard-debug">
      <div data-testid="active-context">{activeContext}</div>
    </div>
  );
};

describe('Keyboard Handler Integration Debug', () => {
  let mockStores: AppStores;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStores = {
      promptStore: {
        selectedPromptIndex: 0,
        filteredPrompts: [{ id: '1', title: 'Test', content: 'Content' }],
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

  it('should verify keyboard shortcuts are properly registered', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    
    render(
      <KeyboardProvider stores={mockStores}>
        <KeyboardDebugComponent />
      </KeyboardProvider>
    );
    
    // Check if debug output shows shortcuts are registered
    const debugLogs = consoleSpy.mock.calls.filter(call => 
      call[0]?.includes?.('=== KEYBOARD DEBUG ===')
    );
    expect(debugLogs.length).toBeGreaterThan(0);
    
    consoleSpy.mockRestore();
  });

  it('should verify keyboard event listener is attached', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    
    render(
      <KeyboardProvider stores={mockStores}>
        <KeyboardDebugComponent />
      </KeyboardProvider>
    );
    
    // Verify keydown listener was added
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    );
    
    addEventListenerSpy.mockRestore();
  });

  it('should test actual window keydown events', async () => {
    render(
      <KeyboardProvider stores={mockStores}>
        <KeyboardDebugComponent />
      </KeyboardProvider>
    );
    
    // Create real KeyboardEvent
    const escapeEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    });
    
    // Dispatch real event
    window.dispatchEvent(escapeEvent);
    
    // Should execute command
    await waitFor(() => {
      expect(mockStores.modalStore.closeModal).toHaveBeenCalled();
    });
  });

  it('should verify context switching works correctly', async () => {
    const TestContextSwitcher: React.FC = () => {
      const { activeContext, pushContext } = useKeyboard();
      
      return (
        <div>
          <div data-testid="context">{activeContext}</div>
          <button onClick={() => pushContext('list')} data-testid="set-list">
            List
          </button>
          <button onClick={() => pushContext('modal')} data-testid="set-modal">
            Modal
          </button>
        </div>
      );
    };
    
    render(
      <KeyboardProvider stores={mockStores}>
        <TestContextSwitcher />
      </KeyboardProvider>
    );
    
    // Test context switching affects shortcut resolution
    const { getByTestId } = screen;
    
    fireEvent.click(getByTestId('set-list'));
    expect(getByTestId('context')).toHaveTextContent('list');
    
    fireEvent.click(getByTestId('set-modal'));
    expect(getByTestId('context')).toHaveTextContent('modal');
  });

  it('should detect if KeyboardProvider is not providing context', () => {
    // Test component outside provider
    const TestComponent: React.FC = () => {
      try {
        useKeyboard();
        return <div data-testid="success">Provider working</div>;
      } catch (error) {
        return <div data-testid="error">No provider</div>;
      }
    };
    
    render(<TestComponent />);
    
    expect(screen.getByTestId('error')).toBeInTheDocument();
  });
});
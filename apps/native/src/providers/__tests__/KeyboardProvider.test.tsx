import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import type { AppStores } from '../../services/AppActionAdapter';
import { KeyboardProvider, useKeyboard } from '../KeyboardProvider';

// Mock stores
const mockStores: AppStores = {
  promptStore: {
    selectedPromptIndex: 0,
    filteredPrompts: [{ id: '1', title: 'Test', content: 'Content' }],
    selectPrompt: vi.fn(),
    navigateUp: vi.fn(),
    navigateDown: vi.fn(),
    selectFirst: vi.fn(),
    selectLast: vi.fn(),
    copySelectedPrompt: vi.fn(),
  },
  modalStore: {
    openHelp: vi.fn(),
    openSettings: vi.fn(),
    openNewPrompt: vi.fn(),
    closeModal: vi.fn(),
  },
  searchStore: {
    focusSearch: vi.fn(),
    clearSearch: vi.fn(),
  },
  formStore: {
    saveForm: vi.fn(),
    cancelForm: vi.fn(),
  },
};

// Test component that uses the keyboard context
const TestComponent: React.FC = () => {
  const { activeContext, pushContext, popContext } = useKeyboard();
  
  return (
    <div>
      <div data-testid="active-context">{activeContext}</div>
      <button onClick={() => pushContext('form')} data-testid="push-form">
        Push Form Context
      </button>
      <button onClick={() => popContext()} data-testid="pop-context">
        Pop Context
      </button>
    </div>
  );
};

describe('KeyboardProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide keyboard context to children', () => {
    render(
      <KeyboardProvider stores={mockStores}>
        <TestComponent />
      </KeyboardProvider>
    );

    expect(screen.getByTestId('active-context')).toHaveTextContent('global');
  });

  it('should allow context switching', () => {
    render(
      <KeyboardProvider stores={mockStores}>
        <TestComponent />
      </KeyboardProvider>
    );

    const pushButton = screen.getByTestId('push-form');
    const popButton = screen.getByTestId('pop-context');
    const contextDisplay = screen.getByTestId('active-context');

    expect(contextDisplay).toHaveTextContent('global');

    fireEvent.click(pushButton);
    expect(contextDisplay).toHaveTextContent('form');

    fireEvent.click(popButton);
    expect(contextDisplay).toHaveTextContent('global');
  });

  it('should handle keyboard events', () => {
    const ContextSetup: React.FC = () => {
      const { pushContext } = useKeyboard();
      
      React.useEffect(() => {
        // Set context to 'list' so arrow keys will work
        pushContext('list');
      }, [pushContext]);
      
      return <TestComponent />;
    };

    render(
      <KeyboardProvider stores={mockStores}>
        <ContextSetup />
      </KeyboardProvider>
    );

    // Test ArrowDown key in list context
    fireEvent.keyDown(document, {
      key: 'ArrowDown',
      code: 'ArrowDown',
    });

    expect(mockStores.promptStore.navigateDown).toHaveBeenCalled();
  });

  it('should handle keyboard events with modifiers', () => {
    render(
      <KeyboardProvider stores={mockStores}>
        <TestComponent />
      </KeyboardProvider>
    );

    // Test Cmd+N (New Prompt)
    fireEvent.keyDown(document, {
      key: 'N',
      code: 'KeyN',
      metaKey: true,
    });

    expect(mockStores.modalStore.openNewPrompt).toHaveBeenCalled();
  });

  it('should provide IME composition state', () => {
    const CompositionTest: React.FC = () => {
      const { isComposing, getCompositionProps } = useKeyboard();
      
      return (
        <div>
          <div data-testid="composing-state">{isComposing.toString()}</div>
          <input {...getCompositionProps()} data-testid="composition-input" />
        </div>
      );
    };

    render(
      <KeyboardProvider stores={mockStores}>
        <CompositionTest />
      </KeyboardProvider>
    );

    const input = screen.getByTestId('composition-input');
    const composingState = screen.getByTestId('composing-state');

    expect(composingState).toHaveTextContent('false');

    // Start composition
    fireEvent.compositionStart(input, { data: '' });
    expect(composingState).toHaveTextContent('true');

    // End composition
    fireEvent.compositionEnd(input, { data: 'こんにちは' });
    expect(composingState).toHaveTextContent('false');
  });

  it('should block shortcuts during composition', () => {
    const CompositionTest: React.FC = () => {
      const { getCompositionProps } = useKeyboard();
      
      return (
        <input {...getCompositionProps()} data-testid="composition-input" />
      );
    };

    render(
      <KeyboardProvider stores={mockStores}>
        <CompositionTest />
      </KeyboardProvider>
    );

    const input = screen.getByTestId('composition-input');

    // Start composition
    fireEvent.compositionStart(input, { data: '' });

    // Try to trigger shortcut during composition
    fireEvent.keyDown(document, {
      key: 'ArrowDown',
      code: 'ArrowDown',
    });

    // Should not execute because composition is active
    expect(mockStores.promptStore.navigateDown).not.toHaveBeenCalled();
  });

  it('should handle context switching with shortcuts', () => {
    const ContextTest: React.FC = () => {
      const { activeContext, pushContext } = useKeyboard();
      
      React.useEffect(() => {
        if (activeContext === 'global') {
          pushContext('list');
        }
      }, [activeContext, pushContext]);
      
      return <div data-testid="context">{activeContext}</div>;
    };

    render(
      <KeyboardProvider stores={mockStores}>
        <ContextTest />
      </KeyboardProvider>
    );

    const contextDisplay = screen.getByTestId('context');
    expect(contextDisplay).toHaveTextContent('list');

    // Test shortcut in list context
    fireEvent.keyDown(document, {
      key: 'Home',
      code: 'Home',
    });

    expect(mockStores.promptStore.selectFirst).toHaveBeenCalled();
  });

  it('should handle keyboard shortcuts without crashing', () => {
    // Test that the provider doesn't crash on errors
    render(
      <KeyboardProvider stores={mockStores}>
        <TestComponent />
      </KeyboardProvider>
    );

    // Multiple keyboard events should work
    fireEvent.keyDown(document, { key: 'N', metaKey: true });
    fireEvent.keyDown(document, { key: 'F', metaKey: true });
    fireEvent.keyDown(document, { key: '?', metaKey: true });

    expect(mockStores.modalStore.openNewPrompt).toHaveBeenCalled();
    expect(mockStores.searchStore.focusSearch).toHaveBeenCalled();
    expect(mockStores.modalStore.openHelp).toHaveBeenCalled();
  });

  it('should initialize with default shortcuts', () => {
    const ShortcutTest: React.FC = () => {
      const { registry } = useKeyboard();
      
      return (
        <div data-testid="has-registry">
          {registry ? 'true' : 'false'}
        </div>
      );
    };

    render(
      <KeyboardProvider stores={mockStores}>
        <ShortcutTest />
      </KeyboardProvider>
    );

    expect(screen.getByTestId('has-registry')).toHaveTextContent('true');
  });

  it('should handle essential shortcuts in input elements', () => {
    render(
      <KeyboardProvider stores={mockStores}>
        <input data-testid="test-input" />
      </KeyboardProvider>
    );

    const input = screen.getByTestId('test-input');
    input.focus();

    // Test Cmd+F (Search Focus) - should work in input
    fireEvent.keyDown(input, {
      key: 'F',
      code: 'KeyF',
      metaKey: true,
    });

    expect(mockStores.searchStore.focusSearch).toHaveBeenCalled();
  });

  it('should ignore non-essential shortcuts in input elements', () => {
    render(
      <KeyboardProvider stores={mockStores}>
        <input data-testid="test-input" />
      </KeyboardProvider>
    );

    const input = screen.getByTestId('test-input');
    input.focus();

    // Test Cmd+N (New Prompt) - should not work in input
    fireEvent.keyDown(input, {
      key: 'N',
      code: 'KeyN',
      metaKey: true,
    });

    expect(mockStores.modalStore.openNewPrompt).not.toHaveBeenCalled();
  });
});
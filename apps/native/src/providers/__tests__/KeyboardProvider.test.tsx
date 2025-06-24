import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import type { AppStores } from '../../services/AppActionAdapter';
import { KeyboardProvider, useKeyboard } from '../KeyboardProvider';

// Mock stores
const mockStores: AppStores = {
  promptStore: {
    selectedPromptIndex: 0,
    filteredPrompts: [{ id: '1', title: 'Test', content: 'Content', tags: [] }],
    selectPrompt: vi.fn(),
    navigateUp: vi.fn(),
    navigateDown: vi.fn(),
    selectFirst: vi.fn(),
    selectLast: vi.fn(),
    copySelectedPrompt: vi.fn(),
    copySelectedPromptAndClose: vi.fn(),
    deletePrompt: vi.fn(),
  },
  modalStore: {
    openHelp: vi.fn(),
    openSettings: vi.fn(),
    openNewPrompt: vi.fn(),
    openEditPrompt: vi.fn(),
    closeModal: vi.fn(),
    hideWindow: vi.fn(),
    hasOpenModal: vi.fn(() => false),
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

// Test component that uses the keyboard context
const TestComponent: React.FC = () => {
  const { activeContext } = useKeyboard();
  
  return (
    <div>
      <div data-testid="active-context">{activeContext}</div>
    </div>
  );
};

const defaultUiState = {
  showCreateForm: false,
  showEditForm: false,
  showHelpModal: false,
  showSettings: false,
};

describe('KeyboardProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide keyboard context to children', () => {
    render(
      <KeyboardProvider stores={mockStores} uiState={defaultUiState}>
        <TestComponent />
      </KeyboardProvider>
    );

    expect(screen.getByTestId('active-context')).toHaveTextContent('list');
  });

  it('should allow context switching', () => {
    const formUiState = {
      showCreateForm: true,
      showEditForm: false,
      showHelpModal: false,
      showSettings: false,
    };

    render(
      <KeyboardProvider stores={mockStores} uiState={formUiState}>
        <TestComponent />
      </KeyboardProvider>
    );

    const contextDisplay = screen.getByTestId('active-context');
    expect(contextDisplay).toHaveTextContent('form');
  });

  it('should handle keyboard events', () => {
    render(
      <KeyboardProvider stores={mockStores} uiState={defaultUiState}>
        <TestComponent />
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
      <KeyboardProvider stores={mockStores} uiState={defaultUiState}>
        <TestComponent />
      </KeyboardProvider>
    );

    // Test Cmd+n key (lowercase as registered in shortcuts)
    fireEvent.keyDown(document, {
      key: 'n',
      code: 'KeyN',
      metaKey: true,
    });

    expect(mockStores.modalStore.openNewPrompt).toHaveBeenCalled();
  });

  it('should provide IME composition state', () => {
    const IMETestComponent: React.FC = () => {
      const { isComposing } = useKeyboard();
      return <div data-testid="ime-state">{isComposing ? 'composing' : 'not-composing'}</div>;
    };

    render(
      <KeyboardProvider stores={mockStores} uiState={defaultUiState}>
        <IMETestComponent />
      </KeyboardProvider>
    );

    expect(screen.getByTestId('ime-state')).toHaveTextContent('not-composing');
  });

  it('should block shortcuts during composition', () => {
    const TestComponentWithInput: React.FC = () => {
      const { getCompositionProps } = useKeyboard();
      return <input data-testid="test-input" {...getCompositionProps()} />;
    };

    render(
      <KeyboardProvider stores={mockStores} uiState={defaultUiState}>
        <TestComponentWithInput />
      </KeyboardProvider>
    );

    const input = screen.getByTestId('test-input');
    
    // Start composition on the input element
    fireEvent.compositionStart(input);
    
    // Try arrow key during composition - should be blocked
    fireEvent.keyDown(document, {
      key: 'ArrowDown',
      code: 'ArrowDown',
    });

    expect(mockStores.promptStore.navigateDown).not.toHaveBeenCalled();
  });

  it('should handle context switching with shortcuts', () => {
    const modalUiState = {
      showCreateForm: false,
      showEditForm: false,
      showHelpModal: true,
      showSettings: false,
    };

    render(
      <KeyboardProvider stores={mockStores} uiState={modalUiState}>
        <TestComponent />
      </KeyboardProvider>
    );

    // Test Escape key in modal context
    fireEvent.keyDown(document, {
      key: 'Escape',
      code: 'Escape',
    });

    expect(mockStores.modalStore.closeModal).toHaveBeenCalled();
  });

  it('should handle keyboard shortcuts without crashing', () => {
    expect(() => {
      render(
        <KeyboardProvider stores={mockStores} uiState={defaultUiState}>
          <TestComponent />
        </KeyboardProvider>
      );

      // Test various keyboard shortcuts
      fireEvent.keyDown(document, { key: 'ArrowUp' });
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      fireEvent.keyDown(document, { key: 'Enter' });
      fireEvent.keyDown(document, { key: 'Escape' });
    }).not.toThrow();
  });

  it('should initialize with default shortcuts', () => {
    render(
      <KeyboardProvider stores={mockStores} uiState={defaultUiState}>
        <TestComponent />
      </KeyboardProvider>
    );

    // Just verify it renders without error
    expect(screen.getByTestId('active-context')).toBeInTheDocument();
  });

});
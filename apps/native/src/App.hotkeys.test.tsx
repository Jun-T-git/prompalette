import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';
import { useFavoritesStore, usePromptStore } from './stores';
import type { PinnedPrompt } from './types';

// Mock the stores
vi.mock('./stores', () => ({
  usePromptStore: vi.fn(() => ({
    prompts: [],
    selectedPrompt: null,
    searchQuery: '',
    isLoading: false,
    error: null,
    setSelectedPrompt: vi.fn(),
    setSearchQuery: vi.fn(),
    createPrompt: vi.fn(),
    updatePrompt: vi.fn(),
    deletePrompt: vi.fn(),
    loadPrompts: vi.fn(),
  })),
  useFavoritesStore: vi.fn(),
}));

// Mock Tauri APIs
vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn(() => Promise.resolve(() => {})),
}));

vi.mock('./utils', () => ({
  copyPromptToClipboard: vi.fn(),
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock hooks
vi.mock('./hooks', () => ({
  useKeyboardNavigation: vi.fn(() => ({
    selectedIndexKeyboard: -1,
    isComposing: false,
    handleKeyDown: vi.fn(),
    setIsComposing: vi.fn(),
    handlePromptSelectEnter: vi.fn(),
    handlePromptSelect: vi.fn(),
    resetSelection: vi.fn(),
  })),
  usePromptSearch: vi.fn(() => ({
    results: [],
    parsedQuery: {
      quickAccessKey: undefined,
      tags: [],
      textTerms: [],
      originalQuery: ''
    }
  })),
  useSearchSuggestions: vi.fn(() => ({
    suggestions: [],
    isVisible: false,
  })),
  useInlineCompletion: vi.fn(() => ({
    completion: '',
    fullText: '',
    type: null
  })),
}));

describe('App Hotkeys', () => {
  const mockSetSelectedPrompt = vi.fn();
  const mockPinnedPrompts: (PinnedPrompt | null)[] = Array(10).fill(null);

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock the prompt store with setSelectedPrompt
    (usePromptStore as any).mockReturnValue({
      prompts: [],
      selectedPrompt: null,
      searchQuery: '',
      isLoading: false,
      error: null,
      setSelectedPrompt: mockSetSelectedPrompt,
      setSearchQuery: vi.fn(),
      createPrompt: vi.fn(),
      updatePrompt: vi.fn(),
      deletePrompt: vi.fn(),
      loadPrompts: vi.fn(),
    });

    // Mock the favorites store
    (useFavoritesStore as any).mockReturnValue({
      pinnedPrompts: mockPinnedPrompts,
      loadPinnedPrompts: vi.fn(),
    });

    // Add a mock pinned prompt at position 1
    mockPinnedPrompts[0] = {
      id: 'test-prompt-1',
      title: 'Test Prompt 1',
      content: 'Test content 1',
      tags: ['test'],
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      position: 1,
      pinned_at: '2023-01-01T00:00:00Z',
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Pinned Prompt Hotkeys', () => {
    it('should select pinned prompt on Ctrl+1 (Windows/Linux)', async () => {
      render(<App />);

      // Simulate Ctrl+1 keydown
      fireEvent.keyDown(document, {
        key: '1',
        ctrlKey: true,
        preventDefault: vi.fn(),
      });

      await waitFor(() => {
        expect(mockSetSelectedPrompt).toHaveBeenCalledWith(mockPinnedPrompts[0]);
      });
    });

    it('should select pinned prompt on Cmd+1 (macOS)', async () => {
      render(<App />);

      // Simulate Cmd+1 keydown
      fireEvent.keyDown(document, {
        key: '1',
        metaKey: true,
        preventDefault: vi.fn(),
      });

      await waitFor(() => {
        expect(mockSetSelectedPrompt).toHaveBeenCalledWith(mockPinnedPrompts[0]);
      });
    });

    it('should show warning when no pinned prompt at position', async () => {
      render(<App />);

      // Simulate Ctrl+2 keydown (position 2 has no pinned prompt)
      fireEvent.keyDown(document, {
        key: '2',
        ctrlKey: true,
        preventDefault: vi.fn(),
      });

      await waitFor(() => {
        expect(screen.getByText('位置2にピン留めプロンプトがありません')).toBeInTheDocument();
      });
    });

    it('should handle Ctrl+0 for position 10', async () => {
      render(<App />);

      // Simulate Ctrl+0 keydown (position 10 has no pinned prompt)
      fireEvent.keyDown(document, {
        key: '0',
        ctrlKey: true,
        preventDefault: vi.fn(),
      });

      await waitFor(() => {
        expect(screen.getByText('位置10にピン留めプロンプトがありません')).toBeInTheDocument();
      });
    });

    it('should not trigger on number keys without modifier', () => {
      render(<App />);

      fireEvent.keyDown(document, {
        key: '1',
        preventDefault: vi.fn(),
      });

      expect(mockSetSelectedPrompt).not.toHaveBeenCalled();
    });

    it('should not interfere with existing Ctrl+N shortcut', async () => {
      render(<App />);

      fireEvent.keyDown(document, {
        key: 'n',
        ctrlKey: true,
        preventDefault: vi.fn(),
      });

      // Should not call setSelectedPrompt
      expect(mockSetSelectedPrompt).not.toHaveBeenCalled();

      // Should show the create form (we can check if the create button appears)
      await waitFor(() => {
        expect(screen.getAllByText('新規作成')).toHaveLength(2); // One in header, one in guide
      });
    });

    it('should preventDefault on hotkey events', () => {
      render(<App />);

      const keyEvent = new KeyboardEvent('keydown', {
        key: '1',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });

      // Spy on preventDefault
      const preventDefaultSpy = vi.spyOn(keyEvent, 'preventDefault');

      document.dispatchEvent(keyEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should not trigger on non-number keys with modifiers', () => {
      render(<App />);

      fireEvent.keyDown(document, {
        key: 'a',
        ctrlKey: true,
        preventDefault: vi.fn(),
      });

      expect(mockSetSelectedPrompt).not.toHaveBeenCalled();
    });

    it('should handle Alt+number keys correctly (should not trigger)', () => {
      render(<App />);

      fireEvent.keyDown(document, {
        key: '1',
        altKey: true,
        preventDefault: vi.fn(),
      });

      expect(mockSetSelectedPrompt).not.toHaveBeenCalled();
    });
  });

  describe('Hotkey Integration', () => {
    it('should preserve existing keyboard navigation functionality', () => {
      render(<App />);

      // Test arrow keys
      fireEvent.keyDown(document, {
        key: 'ArrowDown',
        preventDefault: vi.fn(),
      });

      // Should not interfere with existing keyboard navigation
      expect(mockSetSelectedPrompt).not.toHaveBeenCalled();
    });

    it('should trigger even when input elements are focused (global hotkeys)', () => {
      render(<App />);

      // Focus on the search input that's already in the app
      const searchInput = screen.getByPlaceholderText('プロンプトを検索...');
      searchInput.focus();

      fireEvent.keyDown(document, {
        key: '1',
        ctrlKey: true,
        preventDefault: vi.fn(),
      });

      // Should trigger even when input is focused (global hotkeys)
      expect(mockSetSelectedPrompt).toHaveBeenCalledWith(mockPinnedPrompts[0]);
    });
  });
});

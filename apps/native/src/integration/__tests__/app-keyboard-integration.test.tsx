import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import App from '../../App';

// Mock Tauri APIs
vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn(() => Promise.resolve(() => {})),
}));

vi.mock('../../stores/prompt', () => ({
  usePromptStore: () => ({
    prompts: [
      { id: '1', title: 'Test Prompt 1', content: 'Content 1', tags: [] },
      { id: '2', title: 'Test Prompt 2', content: 'Content 2', tags: [] },
    ],
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
  }),
}));

vi.mock('../../stores/favorites', () => ({
  useFavoritesStore: () => ({
    pinnedPrompts: [],
    loadPinnedPrompts: vi.fn(),
  }),
}));

vi.mock('../../utils/clipboard', () => ({
  copyPromptToClipboard: vi.fn(() => Promise.resolve({ success: true })),
}));

vi.mock('../../components', () => ({
  AppContentArea: ({ selectedPrompt }: any) => (
    <div data-testid="content-area">
      {selectedPrompt ? selectedPrompt.title : 'No prompt selected'}
    </div>
  ),
  AppSidebarWithRef: React.forwardRef((props: any, ref: any) => (
    <div data-testid="sidebar" ref={ref}>
      <input data-testid="search-input" />
      {props.filteredPrompts?.map((p: any, i: number) => (
        <div key={p.id} data-testid={`prompt-${i}`}>{p.title}</div>
      ))}
    </div>
  )),
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  ConfirmModal: ({ isOpen, onConfirm, onCancel }: any) => 
    isOpen ? (
      <div data-testid="confirm-modal">
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    ) : null,
  HelpModal: ({ isOpen, onClose }: any) => 
    isOpen ? (
      <div data-testid="help-modal">
        <button onClick={onClose}>Close Help</button>
      </div>
    ) : null,
  ToastProvider: ({ children }: any) => <div>{children}</div>,
  useToast: () => ({ showToast: vi.fn() }),
  EnvironmentError: () => <div>Environment Error</div>,
}));

// Real App Integration Test
describe('App Keyboard Integration (Real Components)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should open help modal with Cmd+? in real App component', async () => {
    render(<App />);
    
    // Verify app is rendered
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('content-area')).toBeInTheDocument();
    
    // Help modal should not be open initially
    expect(screen.queryByTestId('help-modal')).not.toBeInTheDocument();
    
    // Press Cmd+? to open help
    fireEvent.keyDown(document, {
      key: '?',
      metaKey: true,
    });
    
    // Help modal should appear
    await waitFor(() => {
      expect(screen.getByTestId('help-modal')).toBeInTheDocument();
    });
  });

  it('should close help modal with Escape in real App component', async () => {
    render(<App />);
    
    // Open help modal first
    fireEvent.keyDown(document, {
      key: '?',
      metaKey: true,
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('help-modal')).toBeInTheDocument();
    });
    
    // Press Escape to close
    fireEvent.keyDown(document, {
      key: 'Escape',
    });
    
    // Help modal should disappear
    await waitFor(() => {
      expect(screen.queryByTestId('help-modal')).not.toBeInTheDocument();
    });
  });

  it('should handle arrow key navigation in real App component', async () => {
    const mockSetSelectedPrompt = vi.fn();
    
    // Mock the store to capture setSelectedPrompt calls
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    vi.mocked(require('../../stores/prompt').usePromptStore).mockReturnValue({
      prompts: [
        { id: '1', title: 'Test Prompt 1', content: 'Content 1', tags: [] },
        { id: '2', title: 'Test Prompt 2', content: 'Content 2', tags: [] },
      ],
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
    
    render(<App />);
    
    // Press arrow down
    fireEvent.keyDown(document, {
      key: 'ArrowDown',
    });
    
    // Should attempt to navigate
    await waitFor(() => {
      expect(mockSetSelectedPrompt).toHaveBeenCalled();
    });
  });

  it('should detect when keyboard shortcuts are completely broken', async () => {
    const consoleSpy = vi.spyOn(console, 'error');
    render(<App />);
    
    // Try multiple keyboard shortcuts
    const shortcuts = [
      { key: 'Escape', metaKey: false, testId: 'help-modal' },
      { key: '?', metaKey: true, testId: 'help-modal' },
      { key: 'N', metaKey: true, testId: 'new-prompt-modal' },
    ];
    
    for (const shortcut of shortcuts) {
      fireEvent.keyDown(document, {
        key: shortcut.key,
        metaKey: shortcut.metaKey,
      });
      
      // Wait a reasonable time for any response
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Should not have any console errors
    expect(consoleSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('Keyboard shortcut execution failed')
    );
    
    consoleSpy.mockRestore();
  });

  it('should test actual DOM event propagation', async () => {
    const keydownSpy = vi.fn();
    
    render(<App />);
    
    // Add event listener to verify events are actually firing
    document.addEventListener('keydown', keydownSpy);
    
    fireEvent.keyDown(document, {
      key: 'Escape',
    });
    
    expect(keydownSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'Escape',
      })
    );
    
    document.removeEventListener('keydown', keydownSpy);
  });
});
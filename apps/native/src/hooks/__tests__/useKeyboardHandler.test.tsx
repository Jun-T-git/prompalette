import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ShortcutRegistry } from '../../commands/ShortcutRegistry';
import type { KeyboardShortcut } from '../../types/keyboard.types';
import { useKeyboardHandler } from '../useKeyboardHandler';

// Mock the registry and commands
const mockRegistry = {
  findShortcutByKey: vi.fn(),
  execute: vi.fn(),
} as unknown as ShortcutRegistry;


describe('useKeyboardHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock addEventListener and removeEventListener
    global.addEventListener = vi.fn();
    global.removeEventListener = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with registry', () => {
    const { result } = renderHook(() => useKeyboardHandler(mockRegistry));
    
    expect(result.current).toBeDefined();
    expect(global.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('should clean up event listeners on unmount', () => {
    const { unmount } = renderHook(() => useKeyboardHandler(mockRegistry));
    
    unmount();
    
    expect(global.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('should handle keyboard events and find shortcuts', () => {
    const shortcut: KeyboardShortcut = {
      id: 'navigate_up',
      key: 'ArrowUp',
      modifiers: [],
      context: 'list',
      action: 'NAVIGATE_UP',
      customizable: true,
    };

    mockRegistry.findShortcutByKey = vi.fn().mockReturnValue(shortcut);
    mockRegistry.execute = vi.fn().mockResolvedValue({ success: true });

    renderHook(() => useKeyboardHandler(mockRegistry));

    // Get the keydown handler
    const keydownHandler = (global.addEventListener as any).mock.calls[0][1];

    const mockEvent = {
      key: 'ArrowUp',
      metaKey: false,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      target: { tagName: 'DIV' },
    };

    act(() => {
      keydownHandler(mockEvent);
    });

    expect(mockRegistry.findShortcutByKey).toHaveBeenCalledWith('ArrowUp', [], 'global');
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });

  it('should parse modifiers correctly', () => {
    const shortcut: KeyboardShortcut = {
      id: 'new_prompt',
      key: 'N',
      modifiers: ['cmd'],
      context: 'global',
      action: 'NEW_PROMPT',
      customizable: true,
    };

    mockRegistry.findShortcutByKey = vi.fn().mockReturnValue(shortcut);
    mockRegistry.execute = vi.fn().mockResolvedValue({ success: true });

    renderHook(() => useKeyboardHandler(mockRegistry));
    const keydownHandler = (global.addEventListener as any).mock.calls[0][1];

    const mockEvent = {
      key: 'N',
      metaKey: true,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      target: { tagName: 'DIV' },
    };

    act(() => {
      keydownHandler(mockEvent);
    });

    expect(mockRegistry.findShortcutByKey).toHaveBeenCalledWith('N', ['cmd'], 'global');
  });

  it('should not handle events when shortcuts are blocked (IME composing)', () => {
    const mockIsShortcutsBlocked = vi.fn().mockReturnValue(true);
    
    renderHook(() => useKeyboardHandler(mockRegistry, { isShortcutsBlocked: mockIsShortcutsBlocked }));
    const keydownHandler = (global.addEventListener as any).mock.calls[0][1];

    const mockEvent = {
      key: 'ArrowUp',
      metaKey: false,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      target: { tagName: 'DIV' },
    };

    act(() => {
      keydownHandler(mockEvent);
    });

    expect(mockRegistry.findShortcutByKey).not.toHaveBeenCalled();
    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
  });

  it('should ignore events from input elements', () => {
    // Setup mock to return non-essential shortcut
    const nonEssentialShortcut: KeyboardShortcut = {
      id: 'new_prompt',
      key: 'N',
      modifiers: ['cmd'],
      context: 'global',
      action: 'NEW_PROMPT',
      customizable: true,
    };

    mockRegistry.findShortcutByKey = vi.fn().mockReturnValue(nonEssentialShortcut);
    mockRegistry.execute = vi.fn().mockResolvedValue({ success: true });

    renderHook(() => useKeyboardHandler(mockRegistry));
    const keydownHandler = (global.addEventListener as any).mock.calls[0][1];

    const mockEvent = {
      key: 'N',
      metaKey: true,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      target: { tagName: 'INPUT' },
    };

    act(() => {
      keydownHandler(mockEvent);
    });

    // Should find the shortcut but not execute it
    expect(mockRegistry.findShortcutByKey).toHaveBeenCalled();
    expect(mockRegistry.execute).not.toHaveBeenCalled();
    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
  });

  it('should allow essential shortcuts in input elements', () => {
    const shortcut: KeyboardShortcut = {
      id: 'search_focus',
      key: 'F',
      modifiers: ['cmd'],
      context: 'global',
      action: 'SEARCH_FOCUS',
      customizable: false,
    };

    mockRegistry.findShortcutByKey = vi.fn().mockReturnValue(shortcut);
    mockRegistry.execute = vi.fn().mockResolvedValue({ success: true });

    renderHook(() => useKeyboardHandler(mockRegistry));
    const keydownHandler = (global.addEventListener as any).mock.calls[0][1];

    const mockEvent = {
      key: 'F',
      metaKey: true,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      target: { tagName: 'INPUT' },
    };

    act(() => {
      keydownHandler(mockEvent);
    });

    // Essential shortcuts should work even in input elements
    expect(mockRegistry.findShortcutByKey).toHaveBeenCalled();
  });

  it('should handle execution errors gracefully', async () => {
    const shortcut: KeyboardShortcut = {
      id: 'failing_command',
      key: 'X',
      modifiers: ['cmd'],
      context: 'global',
      action: 'COPY_PROMPT',
      customizable: true,
    };

    mockRegistry.findShortcutByKey = vi.fn().mockReturnValue(shortcut);
    mockRegistry.execute = vi.fn().mockRejectedValue(new Error('Command failed'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderHook(() => useKeyboardHandler(mockRegistry));
    const keydownHandler = (global.addEventListener as any).mock.calls[0][1];

    const mockEvent = {
      key: 'X',
      metaKey: true,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      target: { tagName: 'DIV' },
    };

    await act(async () => {
      keydownHandler(mockEvent);
      // Wait for async execution
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(consoleSpy).toHaveBeenCalledWith('Keyboard shortcut execution failed:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('should update context and re-evaluate shortcuts', () => {
    const mockContextProvider = {
      activeContext: 'list',
    };

    renderHook(() => useKeyboardHandler(mockRegistry, { 
      contextProvider: mockContextProvider 
    }));
    const keydownHandler = (global.addEventListener as any).mock.calls[0][1];

    const mockEvent = {
      key: 'ArrowUp',
      metaKey: false,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      target: { tagName: 'DIV' },
    };

    act(() => {
      keydownHandler(mockEvent);
    });

    expect(mockRegistry.findShortcutByKey).toHaveBeenCalledWith('ArrowUp', [], 'list');
  });
});
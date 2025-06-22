import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useKeyboardHandler } from '../useKeyboardHandler';

// Mock ShortcutRegistry
const mockRegistry = {
  findShortcutByKey: vi.fn(),
  execute: vi.fn(),
};

const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

// Mock global addEventListener/removeEventListener
Object.defineProperty(global, 'addEventListener', {
  value: mockAddEventListener,
  writable: true,
});

Object.defineProperty(global, 'removeEventListener', {
  value: mockRemoveEventListener,
  writable: true,
});

describe('useKeyboardHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with registry', () => {
    renderHook(() => useKeyboardHandler(mockRegistry as any, { 
      contextProvider: { activeContext: 'list' }
    }));

    expect(mockAddEventListener).toHaveBeenCalledWith('keydown', expect.any(Function), expect.any(Object));
  });

  it('should cleanup event listener on unmount', () => {
    const { unmount } = renderHook(() => useKeyboardHandler(mockRegistry as any, { 
      contextProvider: { activeContext: 'list' }
    }));

    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('should ignore events when no shortcut is found', () => {
    mockRegistry.findShortcutByKey.mockReturnValue(null);

    renderHook(() => useKeyboardHandler(mockRegistry as any, { 
      contextProvider: { activeContext: 'list' }
    }));

    const keydownHandler = mockAddEventListener.mock.calls[0][1];
    const mockEvent = {
      key: 'SomeUnknownKey',
      code: 'SomeUnknownKey',
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      altKey: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      target: { tagName: 'DIV' },
    };

    keydownHandler(mockEvent);

    // Should not call execute when no shortcut is found
    expect(mockRegistry.execute).not.toHaveBeenCalled();
    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
  });

  it('should handle keyboard events when shortcut is found', () => {
    const mockShortcut = { id: 'test', action: 'test_action' };
    mockRegistry.findShortcutByKey.mockReturnValue(mockShortcut);
    mockRegistry.execute.mockResolvedValue({ success: true });

    renderHook(() => useKeyboardHandler(mockRegistry as any, { 
      contextProvider: { activeContext: 'list' }
    }));

    const keydownHandler = mockAddEventListener.mock.calls[0][1];
    const mockEvent = {
      key: 'ArrowDown',
      code: 'ArrowDown',
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      altKey: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      target: { tagName: 'DIV' },
    };

    keydownHandler(mockEvent);

    expect(mockRegistry.findShortcutByKey).toHaveBeenCalledWith('ArrowDown', [], 'list');
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });
});
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import type { ContextId } from '../../types/keyboard.types';
import { useKeyboardContext } from '../useKeyboardContext';

describe('useKeyboardContext', () => {
  it('should initialize with global context', () => {
    const { result } = renderHook(() => useKeyboardContext());
    
    expect(result.current.activeContext).toBe('global');
  });

  it('should push and pop contexts', () => {
    const { result } = renderHook(() => useKeyboardContext());

    act(() => {
      result.current.pushContext('search');
    });
    expect(result.current.activeContext).toBe('search');

    act(() => {
      result.current.pushContext('form');
    });
    expect(result.current.activeContext).toBe('form');

    act(() => {
      result.current.popContext();
    });
    expect(result.current.activeContext).toBe('search');

    act(() => {
      result.current.popContext();
    });
    expect(result.current.activeContext).toBe('global');
  });

  it('should not change context when popping empty stack', () => {
    const { result } = renderHook(() => useKeyboardContext());

    act(() => {
      result.current.popContext();
    });
    expect(result.current.activeContext).toBe('global');
  });

  it('should maintain context stack correctly', () => {
    const { result } = renderHook(() => useKeyboardContext());
    const contexts: ContextId[] = ['search', 'list', 'modal'];

    contexts.forEach(context => {
      act(() => {
        result.current.pushContext(context);
      });
    });
    
    expect(result.current.activeContext).toBe('modal');

    // Pop all contexts
    contexts.forEach(() => {
      act(() => {
        result.current.popContext();
      });
    });

    expect(result.current.activeContext).toBe('global');
  });

  it('should provide context information', () => {
    const { result } = renderHook(() => useKeyboardContext());

    act(() => {
      result.current.pushContext('form');
    });

    const contextInfo = result.current.getContextInfo();
    expect(contextInfo.id).toBe('form');
    expect(contextInfo.priority).toBeGreaterThan(0);
  });

  it('should check if a context is active', () => {
    const { result } = renderHook(() => useKeyboardContext());

    expect(result.current.isContextActive('global')).toBe(true);
    expect(result.current.isContextActive('form')).toBe(false);

    act(() => {
      result.current.pushContext('form');
    });

    expect(result.current.isContextActive('form')).toBe(true);
    expect(result.current.isContextActive('global')).toBe(false);
  });

  it('should reset to global context', () => {
    const { result } = renderHook(() => useKeyboardContext());

    act(() => {
      result.current.pushContext('search');
      result.current.pushContext('form');
      result.current.pushContext('modal');
    });

    expect(result.current.activeContext).toBe('modal');

    act(() => {
      result.current.resetContext();
    });

    expect(result.current.activeContext).toBe('global');
  });
});
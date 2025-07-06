import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useIMEComposition } from '../useIMEComposition';

// Mock setTimeout and clearTimeout
vi.mock('timers');

describe('useIMEComposition', () => {
  beforeEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should initialize with composing false', () => {
    const { result } = renderHook(() => useIMEComposition());
    
    expect(result.current.isComposing).toBe(false);
    expect(result.current.isShortcutsBlocked).toBe(false);
  });

  it('should set composing state on composition start', () => {
    const { result } = renderHook(() => useIMEComposition());

    const mockEvent = new CompositionEvent('compositionstart', {
      data: '',
    });

    act(() => {
      result.current.handleCompositionStart(mockEvent);
    });

    expect(result.current.isComposing).toBe(true);
    expect(result.current.isShortcutsBlocked).toBe(true);
  });

  it('should clear composing state on composition end', () => {
    const { result } = renderHook(() => useIMEComposition());

    const startEvent = new CompositionEvent('compositionstart', {
      data: '',
    });

    const endEvent = new CompositionEvent('compositionend', {
      data: 'こんにちは',
    });

    act(() => {
      result.current.handleCompositionStart(startEvent);
    });

    expect(result.current.isComposing).toBe(true);

    act(() => {
      result.current.handleCompositionEnd(endEvent);
    });

    expect(result.current.isComposing).toBe(false);
    // Should still be blocked during grace period
    expect(result.current.isShortcutsBlocked).toBe(true);
  });

  it('should unblock shortcuts after grace period', () => {
    const { result } = renderHook(() => useIMEComposition());

    const startEvent = new CompositionEvent('compositionstart', {
      data: '',
    });

    const endEvent = new CompositionEvent('compositionend', {
      data: 'こんにちは',
    });

    act(() => {
      result.current.handleCompositionStart(startEvent);
      result.current.handleCompositionEnd(endEvent);
    });

    expect(result.current.isShortcutsBlocked).toBe(true);

    // Fast-forward the grace period
    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current.isShortcutsBlocked).toBe(false);
  });

  it('should handle composition update', () => {
    const { result } = renderHook(() => useIMEComposition());

    const startEvent = new CompositionEvent('compositionstart', {
      data: '',
    });

    const updateEvent = new CompositionEvent('compositionupdate', {
      data: 'こ',
    });

    act(() => {
      result.current.handleCompositionStart(startEvent);
      result.current.handleCompositionUpdate(updateEvent);
    });

    expect(result.current.isComposing).toBe(true);
    expect(result.current.compositionData).toBe('こ');
  });

  it('should provide composition event handlers', () => {
    const { result } = renderHook(() => useIMEComposition());

    const handlers = result.current.getCompositionProps();

    expect(handlers).toHaveProperty('onCompositionStart');
    expect(handlers).toHaveProperty('onCompositionUpdate');
    expect(handlers).toHaveProperty('onCompositionEnd');
    expect(typeof handlers.onCompositionStart).toBe('function');
    expect(typeof handlers.onCompositionUpdate).toBe('function');
    expect(typeof handlers.onCompositionEnd).toBe('function');
  });

  it('should reset composition state', () => {
    const { result } = renderHook(() => useIMEComposition());

    const startEvent = new CompositionEvent('compositionstart', {
      data: '',
    });

    act(() => {
      result.current.handleCompositionStart(startEvent);
    });

    expect(result.current.isComposing).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.isComposing).toBe(false);
    expect(result.current.isShortcutsBlocked).toBe(false);
    expect(result.current.compositionData).toBe('');
  });

  it('should clear grace period timer on new composition start', () => {
    const { result } = renderHook(() => useIMEComposition());

    const startEvent = new CompositionEvent('compositionstart', {
      data: '',
    });

    const endEvent = new CompositionEvent('compositionend', {
      data: 'test',
    });

    // Start and end composition
    act(() => {
      result.current.handleCompositionStart(startEvent);
      result.current.handleCompositionEnd(endEvent);
    });

    // Start new composition before grace period ends
    act(() => {
      result.current.handleCompositionStart(startEvent);
    });

    expect(result.current.isComposing).toBe(true);
    expect(result.current.isShortcutsBlocked).toBe(true);

    // Grace period should not affect new composition
    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current.isComposing).toBe(true);
    expect(result.current.isShortcutsBlocked).toBe(true);
  });

  it('should handle overlapping compositions correctly', () => {
    const { result } = renderHook(() => useIMEComposition());

    const startEvent1 = new CompositionEvent('compositionstart', {
      data: '',
    });

    const updateEvent = new CompositionEvent('compositionupdate', {
      data: 'hello',
    });

    const startEvent2 = new CompositionEvent('compositionstart', {
      data: '',
    });

    act(() => {
      result.current.handleCompositionStart(startEvent1);
      result.current.handleCompositionUpdate(updateEvent);
      result.current.handleCompositionStart(startEvent2);
    });

    expect(result.current.isComposing).toBe(true);
    expect(result.current.compositionData).toBe('');
  });
});
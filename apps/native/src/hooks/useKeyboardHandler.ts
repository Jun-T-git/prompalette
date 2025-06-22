import { useEffect, useCallback, useRef } from 'react';

import type { ShortcutRegistry } from '../commands/ShortcutRegistry';
import type { Modifier, ContextId } from '../types/keyboard.types';

export interface KeyboardHandlerOptions {
  isShortcutsBlocked?: () => boolean;
  contextProvider?: {
    activeContext: ContextId;
  };
}

export const useKeyboardHandler = (
  registry: ShortcutRegistry,
  options: KeyboardHandlerOptions = {}
) => {
  const registryRef = useRef(registry);
  registryRef.current = registry;

  const parseModifiers = useCallback((event: KeyboardEvent): Modifier[] => {
    const modifiers: Modifier[] = [];
    
    if (event.metaKey) modifiers.push('cmd');
    if (event.ctrlKey) modifiers.push('ctrl');
    if (event.shiftKey) modifiers.push('shift');
    if (event.altKey) modifiers.push('option');
    
    return modifiers;
  }, []);

  const shouldIgnoreEvent = useCallback((event: KeyboardEvent): boolean => {
    // Check if shortcuts are blocked (e.g., during IME composition)
    if (options.isShortcutsBlocked?.()) {
      return true;
    }

    const modifiers = parseModifiers(event);
    const activeContext = options.contextProvider?.activeContext || 'global';
    const shortcut = registryRef.current.findShortcutByKey(
      event.key,
      modifiers,
      activeContext
    );

    // Only intervene for registered app shortcuts - let everything else be native
    if (!shortcut) {
      return true; // Let browser handle it natively
    }
    
    return false; // Let shortcut system handle it
  }, [options.isShortcutsBlocked, options.contextProvider, parseModifiers]);

  const handleKeyDown = useCallback(async (event: KeyboardEvent) => {
    const shouldIgnore = shouldIgnoreEvent(event);
    
    if (shouldIgnore) {
      return;
    }

    const modifiers = parseModifiers(event);
    const activeContext = options.contextProvider?.activeContext || 'global';
    
    const shortcut = registryRef.current.findShortcutByKey(
      event.key,
      modifiers,
      activeContext
    );

    if (shortcut) {
      event.preventDefault();
      event.stopPropagation();

      try {
        await registryRef.current.execute(shortcut.id, {
          id: activeContext,
          priority: 1, // Will be properly calculated by context provider
        });
      } catch (error) {
        console.error('Keyboard shortcut execution failed:', error);
      }
    }
  }, [shouldIgnoreEvent, parseModifiers, options.contextProvider]);

  useEffect(() => {
    const handleKeyDownEvent = (event: KeyboardEvent) => {
      handleKeyDown(event);
    };

    window.addEventListener('keydown', handleKeyDownEvent, { capture: false, passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDownEvent);
    };
  }, [handleKeyDown]);

  return {
    // Expose for testing
    handleKeyDown,
  };
};
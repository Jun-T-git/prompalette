import { useEffect, useCallback, useRef } from 'react';

import type { ShortcutRegistry } from '../commands/ShortcutRegistry';
import { isEssentialShortcut, isInputElementTag } from '../constants/keyboard';
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

    const target = event.target as HTMLElement;
    const isInputElement = isInputElementTag(target.tagName);

    // In input elements, only allow essential shortcuts
    if (isInputElement) {
      const modifiers = parseModifiers(event);
      const activeContext = options.contextProvider?.activeContext || 'global';
      const shortcut = registryRef.current.findShortcutByKey(
        event.key,
        modifiers,
        activeContext
      );

      // If no shortcut found or it's not essential, ignore the event
      if (!shortcut || !isEssentialShortcut(shortcut.id)) {
        return true;
      }
    }

    return false;
  }, [options.isShortcutsBlocked, options.contextProvider, parseModifiers]);

  const handleKeyDown = useCallback(async (event: KeyboardEvent) => {
    if (shouldIgnoreEvent(event)) {
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

    window.addEventListener('keydown', handleKeyDownEvent);

    return () => {
      window.removeEventListener('keydown', handleKeyDownEvent);
    };
  }, [handleKeyDown]);

  return {
    // Expose for testing
    handleKeyDown,
  };
};
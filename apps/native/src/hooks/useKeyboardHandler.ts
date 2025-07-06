import { useCallback, useEffect, useRef } from 'react';

import type { ShortcutRegistry } from '../commands/ShortcutRegistry';
import type { ContextId, Modifier } from '../types/keyboard.types';
import { logger } from '../utils/logger';

export interface KeyboardHandlerOptions {
  isShortcutsBlocked?: () => boolean;
  contextProvider?: {
    activeContext: ContextId;
  };
}

export const useKeyboardHandler = (
  registry: ShortcutRegistry,
  options: KeyboardHandlerOptions = {},
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

  const shouldIgnoreEvent = useCallback(
    (event: KeyboardEvent): boolean => {
      // Check if shortcuts are blocked (e.g., during IME composition)
      if (options.isShortcutsBlocked?.()) {
        return true;
      }

      const modifiers = parseModifiers(event);
      const activeContext = options.contextProvider?.activeContext || 'global';
      
      // Special handling for form context
      if (activeContext === 'form') {
        // In form context, let Enter key be handled natively (for line breaks in textarea)
        // unless it's a form-specific shortcut (like Cmd+S for save)
        if (event.key === 'Enter' && modifiers.length === 0) {
          return true; // Let browser handle Enter natively for line breaks
        }
        
        // Allow text editing shortcuts in form context
        const isTextEditingShortcut = (
          (modifiers.includes('cmd') || modifiers.includes('ctrl')) &&
          (event.key === '[' || event.key === ']' || // Indent/outdent
           event.key === 'z' || event.key === 'y' ||  // Undo/redo
           event.key === 'a' || event.key === 'x' ||  // Select all, cut
           event.key === 'c' || event.key === 'v')    // Copy, paste
        );
        
        if (isTextEditingShortcut) {
          return true; // Let browser/form handle text editing shortcuts natively
        }
        
        // Check if the target is a form element that should handle the key natively
        const target = event.target as HTMLElement;
        if (target && (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT')) {
          // For form shortcuts like Cmd+S, still check the registry
          const shortcut = registryRef.current.findShortcutByKey(event.key, modifiers, activeContext);
          if (!shortcut) {
            return true; // Let form element handle it natively
          }
          // Form shortcuts (like Cmd+S) should be handled by the shortcut system
          return false;
        }
      }

      const shortcut = registryRef.current.findShortcutByKey(event.key, modifiers, activeContext);

      // Only intervene for registered app shortcuts - let everything else be native
      if (!shortcut) {
        return true; // Let browser handle it natively
      }

      return false; // Let shortcut system handle it
    },
    [options.isShortcutsBlocked, options.contextProvider, parseModifiers],
  );

  const handleKeyDown = useCallback(
    async (event: KeyboardEvent) => {
      const shouldIgnore = shouldIgnoreEvent(event);

      if (shouldIgnore) {
        return;
      }

      const modifiers = parseModifiers(event);
      const activeContext = options.contextProvider?.activeContext || 'global';

      const shortcut = registryRef.current.findShortcutByKey(event.key, modifiers, activeContext);

      logger.debug(`Key down: ${event.key}, Modifiers: ${modifiers.join('+')}, Context: ${activeContext}`);
      logger.debug('Shortcut found:', shortcut);

      if (shortcut) {
        event.preventDefault();
        event.stopPropagation();

        try {
          await registryRef.current.execute(shortcut.id, {
            id: activeContext,
            priority: 1, // Will be properly calculated by context provider
          });
        } catch (error) {
          logger.error('Keyboard shortcut execution failed:', error);
        }
      }
    },
    [shouldIgnoreEvent, parseModifiers, options.contextProvider],
  );

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


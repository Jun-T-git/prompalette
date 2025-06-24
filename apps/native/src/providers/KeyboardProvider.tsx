import React, { createContext, useContext, useEffect, useMemo, useRef } from 'react';

import {
  EditPromptCommand,
  NewPromptCommand,
  SaveCommand,
  SearchFocusCommand,
  ShowHelpCommand,
  ShowSettingsCommand,
} from '../commands/EssentialCommands';
import type { KeyboardCommand } from '../commands/KeyboardCommand';
import {
  CancelCommand,
  ConfirmCommand,
  NavigateDownCommand,
  NavigateUpCommand,
  SelectFirstCommand,
  SelectLastCommand,
} from '../commands/NavigationCommands';
import { ShortcutRegistry } from '../commands/ShortcutRegistry';
import { useIMEComposition } from '../hooks/useIMEComposition';
import { useKeyboardHandler } from '../hooks/useKeyboardHandler';
import { AppActionAdapter, type AppStores } from '../services/AppActionAdapter';
import type { ContextId, KeyboardShortcut } from '../types/keyboard.types';
import { getKeyboardContextFromUI, logContextChange, type UIState } from '../utils/keyboardContext';

interface KeyboardContextValue {
  // Context management (now derived from UI state)
  activeContext: ContextId;

  // IME composition
  isComposing: boolean;
  getCompositionProps: () => {
    onCompositionStart: (event: React.CompositionEvent) => void;
    onCompositionUpdate: (event: React.CompositionEvent) => void;
    onCompositionEnd: (event: React.CompositionEvent) => void;
  };

  // Registry access (for advanced use cases)
  registry: ShortcutRegistry;
}

const KeyboardContext = createContext<KeyboardContextValue | null>(null);

interface KeyboardProviderProps {
  children: React.ReactNode;
  stores: AppStores;
  // UI state for context derivation
  uiState: UIState;
}

export const KeyboardProvider: React.FC<KeyboardProviderProps> = ({
  children,
  stores,
  uiState,
}) => {
  // Derive context from UI state (Single Source of Truth)
  const activeContext = useMemo(() => {
    return getKeyboardContextFromUI(uiState);
  }, [uiState]);

  // Debug logging for context changes
  const previousContext = useRef<ContextId | null>(null);
  useEffect(() => {
    logContextChange(previousContext.current, activeContext, uiState);
    previousContext.current = activeContext;
  }, [activeContext, uiState]);

  const imeComposition = useIMEComposition();

  // Create simple context provider object for the adapter
  const contextProvider = useMemo(
    () => ({
      activeContext,
    }),
    [activeContext],
  );

  // Create adapter and registry
  const adapter = useMemo(
    () => new AppActionAdapter(stores, contextProvider),
    [stores, contextProvider],
  );
  const registry = useMemo(() => {
    const reg = new ShortcutRegistry();

    // Register default shortcuts
    registerDefaultShortcuts(reg, adapter);

    return reg;
  }, [adapter]);

  // Initialize keyboard handler
  useKeyboardHandler(registry, {
    isShortcutsBlocked: () => imeComposition.isShortcutsBlocked,
    contextProvider,
  });

  const contextValue: KeyboardContextValue = {
    activeContext,
    isComposing: imeComposition.isComposing,
    getCompositionProps: imeComposition.getCompositionProps,
    registry,
  };

  // Debug: expose keyboard context to window for E2E testing (development only)
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      // Type-safe window extension for debugging
      interface DebugWindow extends Window {
        __keyboardContext?: ContextId;
        __keyboardProvider?: KeyboardContextValue;
      }
      const debugWindow = window as DebugWindow;
      debugWindow.__keyboardContext = activeContext;
      debugWindow.__keyboardProvider = contextValue;
    }
  }, [activeContext, contextValue]);

  return <KeyboardContext.Provider value={contextValue}>{children}</KeyboardContext.Provider>;
};

export const useKeyboard = (): KeyboardContextValue => {
  const context = useContext(KeyboardContext);
  if (!context) {
    throw new Error('useKeyboard must be used within a KeyboardProvider');
  }
  return context;
};

// Helper function to register default shortcuts
function registerDefaultShortcuts(registry: ShortcutRegistry, adapter: AppActionAdapter) {
  const shortcuts: Array<{ shortcut: KeyboardShortcut; command: KeyboardCommand }> = [
    // Navigation shortcuts
    {
      shortcut: {
        id: 'navigate_up',
        key: 'ArrowUp',
        modifiers: [],
        context: 'list',
        action: 'NAVIGATE_UP',
        customizable: true,
      },
      command: new NavigateUpCommand(adapter.navigateUp.bind(adapter)),
    },
    {
      shortcut: {
        id: 'navigate_down',
        key: 'ArrowDown',
        modifiers: [],
        context: 'list',
        action: 'NAVIGATE_DOWN',
        customizable: true,
      },
      command: new NavigateDownCommand(adapter.navigateDown.bind(adapter)),
    },
    {
      shortcut: {
        id: 'select_first',
        key: 'Home',
        modifiers: [],
        context: 'list',
        action: 'SELECT_FIRST',
        customizable: true,
      },
      command: new SelectFirstCommand(adapter.selectFirst.bind(adapter)),
    },
    {
      shortcut: {
        id: 'select_last',
        key: 'End',
        modifiers: [],
        context: 'list',
        action: 'SELECT_LAST',
        customizable: true,
      },
      command: new SelectLastCommand(adapter.selectLast.bind(adapter)),
    },
    {
      shortcut: {
        id: 'confirm',
        key: 'Enter',
        modifiers: [],
        context: 'global',
        action: 'CONFIRM',
        customizable: true,
      },
      command: new ConfirmCommand(adapter.confirm.bind(adapter)),
    },
    {
      shortcut: {
        id: 'cancel',
        key: 'Escape',
        modifiers: [],
        context: 'global',
        action: 'CANCEL',
        customizable: true,
      },
      command: new CancelCommand(adapter.cancel.bind(adapter)),
    },
    {
      shortcut: {
        id: 'new_prompt',
        key: 'n',
        modifiers: ['cmd'],
        context: 'global',
        action: 'NEW_PROMPT',
        customizable: true,
      },
      command: new NewPromptCommand(adapter.newPrompt.bind(adapter)),
    },
    {
      shortcut: {
        id: 'edit_prompt',
        key: 'e',
        modifiers: ['cmd'],
        context: 'global',
        action: 'EDIT_PROMPT',
        customizable: true,
      },
      command: new EditPromptCommand(adapter.editPrompt.bind(adapter)),
    },
    {
      shortcut: {
        id: 'search_focus',
        key: 'f',
        modifiers: ['cmd'],
        context: 'list',
        action: 'SEARCH_FOCUS',
        customizable: true,
      },
      command: new SearchFocusCommand(adapter.searchFocus.bind(adapter)),
    },
    {
      shortcut: {
        id: 'save',
        key: 's',
        modifiers: ['cmd'],
        context: 'form',
        action: 'SAVE',
        customizable: true,
      },
      command: new SaveCommand(adapter.save.bind(adapter)),
    },
    {
      shortcut: {
        id: 'show_help',
        key: 'h',
        modifiers: ['cmd'],
        context: 'global',
        action: 'SHOW_HELP',
        customizable: true,
      },
      command: new ShowHelpCommand(adapter.showHelp.bind(adapter)),
    },
    {
      shortcut: {
        id: 'show_settings',
        key: ',',
        modifiers: ['cmd'],
        context: 'global',
        action: 'SHOW_SETTINGS',
        customizable: true,
      },
      command: new ShowSettingsCommand(adapter.showSettings.bind(adapter)),
    },
  ];

  shortcuts.forEach(({ shortcut, command }) => {
    registry.register(shortcut, command);
  });
}


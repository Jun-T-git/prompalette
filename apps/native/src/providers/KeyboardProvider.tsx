import React, { createContext, useContext, useMemo } from 'react';

import {
  NewPromptCommand,
  SearchFocusCommand,
  SaveCommand,
  ShowHelpCommand,
  ShowSettingsCommand
} from '../commands/EssentialCommands';
import { 
  NavigateUpCommand, 
  NavigateDownCommand, 
  SelectFirstCommand, 
  SelectLastCommand,
  ConfirmCommand,
  CancelCommand 
} from '../commands/NavigationCommands';
import { ShortcutRegistry } from '../commands/ShortcutRegistry';
import { useIMEComposition } from '../hooks/useIMEComposition';
import { useKeyboardContext } from '../hooks/useKeyboardContext';
import { useKeyboardHandler } from '../hooks/useKeyboardHandler';
import { AppActionAdapter, type AppStores } from '../services/AppActionAdapter';
import type { ContextId, KeyboardShortcut } from '../types/keyboard.types';

interface KeyboardContextValue {
  // Context management
  activeContext: ContextId;
  pushContext: (context: ContextId) => void;
  popContext: () => void;
  
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
}

export const KeyboardProvider: React.FC<KeyboardProviderProps> = ({ 
  children, 
  stores 
}) => {
  // Initialize core hooks
  const keyboardContext = useKeyboardContext();
  const imeComposition = useIMEComposition();
  
  // Create adapter and registry
  const adapter = useMemo(() => new AppActionAdapter(stores, keyboardContext), [stores, keyboardContext]);
  const registry = useMemo(() => {
    const reg = new ShortcutRegistry();
    
    // Register default shortcuts
    registerDefaultShortcuts(reg, adapter);
    
    return reg;
  }, [adapter]);

  // Initialize keyboard handler
  useKeyboardHandler(registry, {
    isShortcutsBlocked: () => imeComposition.isShortcutsBlocked,
    contextProvider: keyboardContext,
  });

  const contextValue: KeyboardContextValue = {
    activeContext: keyboardContext.activeContext,
    pushContext: keyboardContext.pushContext,
    popContext: keyboardContext.popContext,
    isComposing: imeComposition.isComposing,
    getCompositionProps: imeComposition.getCompositionProps,
    registry,
  };

  // Debug: expose keyboard context to window for E2E testing
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__keyboardContext = keyboardContext.activeContext;
      (window as any).__keyboardProvider = contextValue;
    }
  }, [keyboardContext.activeContext, contextValue]);

  return (
    <KeyboardContext.Provider value={contextValue}>
      {children}
    </KeyboardContext.Provider>
  );
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
  const shortcuts: Array<{ shortcut: KeyboardShortcut, command: any }> = [
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
    
    // Essential shortcuts
    {
      shortcut: {
        id: 'new_prompt',
        key: 'N',
        modifiers: ['cmd'],
        context: 'global',
        action: 'NEW_PROMPT',
        customizable: true,
      },
      command: new NewPromptCommand(adapter.newPrompt.bind(adapter)),
    },
    {
      shortcut: {
        id: 'search_focus',
        key: 'F',
        modifiers: ['cmd'],
        context: 'global',
        action: 'SEARCH_FOCUS',
        customizable: true,
      },
      command: new SearchFocusCommand(adapter.searchFocus.bind(adapter)),
    },
    {
      shortcut: {
        id: 'save',
        key: 'S',
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
        key: '?',
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
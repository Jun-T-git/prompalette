import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { KeyboardShortcut, ContextId, Modifier } from '../types/keyboard.types';

interface KeyboardStore {
  // State
  shortcuts: Map<string, KeyboardShortcut>;
  customShortcuts: Map<string, string>;
  activeContext: ContextId;
  isComposing: boolean;
  
  // Actions
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  updateCustomShortcut: (id: string, newKey: string) => void;
  setContext: (context: ContextId) => void;
  setComposing: (composing: boolean) => void;
  
  // Selectors
  getShortcutsForContext: (context: ContextId) => KeyboardShortcut[];
  getShortcutByKey: (key: string, modifiers: Modifier[]) => KeyboardShortcut | null;
}

export const useKeyboardStore = create<KeyboardStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      shortcuts: new Map(),
      customShortcuts: new Map(),
      activeContext: 'global',
      isComposing: false,

      // Actions
      registerShortcut: (shortcut) => {
        set((state) => {
          const newShortcuts = new Map(state.shortcuts);
          newShortcuts.set(shortcut.id, shortcut);
          return { shortcuts: newShortcuts };
        });
      },

      updateCustomShortcut: (id, newKey) => {
        set((state) => {
          const newCustomShortcuts = new Map(state.customShortcuts);
          newCustomShortcuts.set(id, newKey);
          return { customShortcuts: newCustomShortcuts };
        });
      },

      setContext: (context) => {
        set({ activeContext: context });
      },

      setComposing: (composing) => {
        set({ isComposing: composing });
      },

      // Selectors
      getShortcutsForContext: (context) => {
        const { shortcuts } = get();
        return Array.from(shortcuts.values()).filter(
          (shortcut) => shortcut.context === context
        );
      },

      getShortcutByKey: (key, modifiers) => {
        const { shortcuts, customShortcuts } = get();
        
        // Helper to parse custom shortcut string
        const parseCustomShortcut = (customKey: string): { key: string; modifiers: Modifier[] } => {
          const parts = customKey.toLowerCase().split('+');
          const keyPart = parts.pop()?.toUpperCase() || '';
          const mods = parts.map(mod => {
            if (mod === 'cmd' || mod === 'command') return 'cmd';
            if (mod === 'ctrl' || mod === 'control') return 'ctrl';
            if (mod === 'shift') return 'shift';
            if (mod === 'option' || mod === 'alt') return 'option';
            return mod;
          }) as Modifier[];
          
          return { key: keyPart, modifiers: mods };
        };

        // Helper to compare modifiers
        const modifiersMatch = (mods1: Modifier[], mods2: Modifier[]): boolean => {
          if (mods1.length !== mods2.length) return false;
          const sorted1 = [...mods1].sort();
          const sorted2 = [...mods2].sort();
          return sorted1.every((mod, index) => mod === sorted2[index]);
        };

        // Check each shortcut
        for (const [id, shortcut] of shortcuts) {
          // Check if there's a custom mapping
          const customMapping = customShortcuts.get(id);
          
          if (customMapping) {
            const { key: customKey, modifiers: customMods } = parseCustomShortcut(customMapping);
            if (key === customKey && modifiersMatch(modifiers, customMods)) {
              return shortcut;
            }
          } else {
            // Check original shortcut
            if (key === shortcut.key && modifiersMatch(modifiers, shortcut.modifiers)) {
              return shortcut;
            }
          }
        }

        return null;
      },
    }),
    {
      name: 'keyboard-store',
    }
  )
);
import { describe, it, expect, beforeEach } from 'vitest';

import type { KeyboardShortcut } from '../../types/keyboard.types';
import { useKeyboardStore } from '../keyboard.store';

describe('KeyboardStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useKeyboardStore.setState({
      shortcuts: new Map(),
      customShortcuts: new Map(),
      activeContext: 'global',
      isComposing: false,
    });
  });

  describe('registerShortcut', () => {
    it('should register a new shortcut', () => {
      const shortcut: KeyboardShortcut = {
        id: 'copy',
        key: 'C',
        modifiers: ['cmd'],
        context: 'list',
        action: 'COPY_PROMPT',
        customizable: true,
      };

      useKeyboardStore.getState().registerShortcut(shortcut);

      const registered = useKeyboardStore.getState().shortcuts.get('copy');
      expect(registered).toEqual(shortcut);
    });

    it('should overwrite existing shortcut with same id', () => {
      const shortcut1: KeyboardShortcut = {
        id: 'copy',
        key: 'C',
        modifiers: ['cmd'],
        context: 'list',
        action: 'COPY_PROMPT',
        customizable: true,
      };

      const shortcut2: KeyboardShortcut = {
        ...shortcut1,
        key: 'K',
      };

      const { registerShortcut } = useKeyboardStore.getState();
      registerShortcut(shortcut1);
      registerShortcut(shortcut2);

      const registered = useKeyboardStore.getState().shortcuts.get('copy');
      expect(registered?.key).toBe('K');
    });
  });

  describe('updateCustomShortcut', () => {
    it('should update custom shortcut mapping', () => {
      const { updateCustomShortcut } = useKeyboardStore.getState();
      updateCustomShortcut('copy', 'cmd+k');

      expect(useKeyboardStore.getState().customShortcuts.get('copy')).toBe('cmd+k');
    });
  });

  describe('setContext', () => {
    it('should update active context', () => {
      const store = useKeyboardStore.getState();
      expect(store.activeContext).toBe('global');

      store.setContext('form');
      expect(useKeyboardStore.getState().activeContext).toBe('form');
    });
  });

  describe('setComposing', () => {
    it('should update composing state', () => {
      const store = useKeyboardStore.getState();
      expect(store.isComposing).toBe(false);

      store.setComposing(true);
      expect(useKeyboardStore.getState().isComposing).toBe(true);

      store.setComposing(false);
      expect(useKeyboardStore.getState().isComposing).toBe(false);
    });
  });

  describe('getShortcutsForContext', () => {
    it('should return shortcuts for specific context', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          id: 'copy',
          key: 'C',
          modifiers: ['cmd'],
          context: 'list',
          action: 'COPY_PROMPT',
          customizable: true,
        },
        {
          id: 'delete',
          key: 'D',
          modifiers: ['cmd'],
          context: 'list',
          action: 'DELETE_PROMPT',
          customizable: true,
        },
        {
          id: 'save',
          key: 'S',
          modifiers: ['cmd'],
          context: 'form',
          action: 'SAVE',
          customizable: true,
        },
      ];

      const store = useKeyboardStore.getState();
      shortcuts.forEach(s => store.registerShortcut(s));

      const listShortcuts = store.getShortcutsForContext('list');
      expect(listShortcuts).toHaveLength(2);
      expect(listShortcuts.map(s => s.id)).toContain('copy');
      expect(listShortcuts.map(s => s.id)).toContain('delete');

      const formShortcuts = store.getShortcutsForContext('form');
      expect(formShortcuts).toHaveLength(1);
      expect(formShortcuts[0].id).toBe('save');
    });
  });

  describe('getShortcutByKey', () => {
    it('should find shortcut by key combination', () => {
      const shortcut: KeyboardShortcut = {
        id: 'copy',
        key: 'C',
        modifiers: ['cmd'],
        context: 'list',
        action: 'COPY_PROMPT',
        customizable: true,
      };

      const store = useKeyboardStore.getState();
      store.registerShortcut(shortcut);

      const found = store.getShortcutByKey('C', ['cmd']);
      expect(found).toEqual(shortcut);
    });

    it('should return null when no matching shortcut', () => {
      const store = useKeyboardStore.getState();
      const found = store.getShortcutByKey('X', ['cmd']);
      expect(found).toBeNull();
    });

    it('should match modifiers in any order', () => {
      const shortcut: KeyboardShortcut = {
        id: 'activate',
        key: 'P',
        modifiers: ['cmd', 'shift'],
        context: 'global',
        action: 'ACTIVATE_APP',
        customizable: false,
      };

      const store = useKeyboardStore.getState();
      store.registerShortcut(shortcut);

      const found1 = store.getShortcutByKey('P', ['cmd', 'shift']);
      const found2 = store.getShortcutByKey('P', ['shift', 'cmd']);

      expect(found1).toEqual(shortcut);
      expect(found2).toEqual(shortcut);
    });

    it('should consider custom shortcuts', () => {
      const shortcut: KeyboardShortcut = {
        id: 'copy',
        key: 'C',
        modifiers: ['cmd'],
        context: 'list',
        action: 'COPY_PROMPT',
        customizable: true,
      };

      const store = useKeyboardStore.getState();
      store.registerShortcut(shortcut);
      store.updateCustomShortcut('copy', 'cmd+k');

      // Original key should not match
      const originalFound = store.getShortcutByKey('C', ['cmd']);
      expect(originalFound).toBeNull();

      // Custom key should match
      const customFound = store.getShortcutByKey('K', ['cmd']);
      expect(customFound).toEqual(shortcut);
    });
  });
});
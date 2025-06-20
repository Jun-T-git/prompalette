import { describe, it, expect, vi, beforeEach } from 'vitest';

import type { KeyboardShortcut, KeyboardContext, CommandResult } from '../../types/keyboard.types';
import { BaseKeyboardCommand } from '../KeyboardCommand';
import { ShortcutRegistry } from '../ShortcutRegistry';

class MockCommand extends BaseKeyboardCommand {
  constructor(
    id: string,
    private executeFn: () => Promise<CommandResult>,
    private canExecuteFn: (context: KeyboardContext) => boolean
  ) {
    super(id);
  }

  protected async doExecute(): Promise<CommandResult> {
    return this.executeFn();
  }

  canExecute(context: KeyboardContext): boolean {
    return this.canExecuteFn(context);
  }
}

describe('ShortcutRegistry', () => {
  let registry: ShortcutRegistry;

  beforeEach(() => {
    registry = new ShortcutRegistry();
  });

  describe('register', () => {
    it('should register a shortcut with its command', () => {
      const shortcut: KeyboardShortcut = {
        id: 'copy',
        key: 'C',
        modifiers: ['cmd'],
        context: 'list',
        action: 'COPY_PROMPT',
        customizable: true,
      };

      const command = new MockCommand(
        'copy',
        async () => ({ success: true }),
        () => true
      );

      registry.register(shortcut, command);

      expect(registry.getShortcut('copy')).toEqual(shortcut);
    });

    it('should throw error when registering duplicate shortcut id', () => {
      const shortcut: KeyboardShortcut = {
        id: 'copy',
        key: 'C',
        modifiers: ['cmd'],
        context: 'list',
        action: 'COPY_PROMPT',
        customizable: true,
      };

      const command = new MockCommand('copy', async () => ({ success: true }), () => true);

      registry.register(shortcut, command);
      
      expect(() => registry.register(shortcut, command)).toThrow(
        'Shortcut with id "copy" already registered'
      );
    });
  });

  describe('execute', () => {
    it('should execute command when context matches', async () => {
      const executeFn = vi.fn().mockResolvedValue({ success: true, data: 'copied' });
      const canExecuteFn = vi.fn().mockReturnValue(true);

      const shortcut: KeyboardShortcut = {
        id: 'copy',
        key: 'C',
        modifiers: ['cmd'],
        context: 'list',
        action: 'COPY_PROMPT',
        customizable: true,
      };

      const command = new MockCommand('copy', executeFn, canExecuteFn);
      registry.register(shortcut, command);

      const context: KeyboardContext = { id: 'list', priority: 1 };
      const result = await registry.execute('copy', context);

      expect(canExecuteFn).toHaveBeenCalledWith(context);
      expect(executeFn).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data).toBe('copied');
    });

    it('should not execute command when context does not match', async () => {
      const executeFn = vi.fn();
      const canExecuteFn = vi.fn().mockReturnValue(false);

      const shortcut: KeyboardShortcut = {
        id: 'copy',
        key: 'C',
        modifiers: ['cmd'],
        context: 'list',
        action: 'COPY_PROMPT',
        customizable: true,
      };

      const command = new MockCommand('copy', executeFn, canExecuteFn);
      registry.register(shortcut, command);

      const context: KeyboardContext = { id: 'form', priority: 2 };
      const result = await registry.execute('copy', context);

      expect(canExecuteFn).toHaveBeenCalledWith(context);
      expect(executeFn).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Command not available in current context');
    });

    it('should return error when shortcut not found', async () => {
      const context: KeyboardContext = { id: 'list', priority: 1 };
      const result = await registry.execute('nonexistent', context);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Shortcut "nonexistent" not found');
    });
  });

  describe('findShortcutByKey', () => {
    it('should find shortcut by key combination and context', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          id: 'copy_list',
          key: 'C',
          modifiers: ['cmd'],
          context: 'list',
          action: 'COPY_PROMPT',
          customizable: true,
        },
        {
          id: 'copy_form',
          key: 'C',
          modifiers: ['cmd'],
          context: 'form',
          action: 'COPY_PROMPT',
          customizable: true,
        },
      ];

      shortcuts.forEach((shortcut, index) => {
        const command = new MockCommand(
          shortcut.id,
          async () => ({ success: true }),
          () => true
        );
        registry.register(shortcut, command);
      });

      const found = registry.findShortcutByKey('C', ['cmd'], 'list');
      expect(found?.id).toBe('copy_list');

      const foundForm = registry.findShortcutByKey('C', ['cmd'], 'form');
      expect(foundForm?.id).toBe('copy_form');
    });

    it('should return null when no matching shortcut found', () => {
      const shortcut: KeyboardShortcut = {
        id: 'copy',
        key: 'C',
        modifiers: ['cmd'],
        context: 'list',
        action: 'COPY_PROMPT',
        customizable: true,
      };

      const command = new MockCommand('copy', async () => ({ success: true }), () => true);
      registry.register(shortcut, command);

      const found = registry.findShortcutByKey('V', ['cmd'], 'list');
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

      const command = new MockCommand('activate', async () => ({ success: true }), () => true);
      registry.register(shortcut, command);

      const found1 = registry.findShortcutByKey('P', ['cmd', 'shift'], 'global');
      const found2 = registry.findShortcutByKey('P', ['shift', 'cmd'], 'global');

      expect(found1?.id).toBe('activate');
      expect(found2?.id).toBe('activate');
    });

    it('should find global shortcuts from any context (fallback)', () => {
      // Register a global shortcut
      const globalShortcut: KeyboardShortcut = {
        id: 'global_help',
        key: '?',
        modifiers: ['cmd'],
        context: 'global',
        action: 'SHOW_HELP',
        customizable: true,
      };
      
      const command = new MockCommand('global_help', async () => ({ success: true }), () => true);
      registry.register(globalShortcut, command);

      // Should find global shortcut when in global context
      const foundInGlobal = registry.findShortcutByKey('?', ['cmd'], 'global');
      expect(foundInGlobal).toEqual(globalShortcut);

      // Should ALSO find global shortcut when in other contexts (fallback)
      const foundInList = registry.findShortcutByKey('?', ['cmd'], 'list');
      expect(foundInList).toEqual(globalShortcut);

      const foundInForm = registry.findShortcutByKey('?', ['cmd'], 'form');
      expect(foundInForm).toEqual(globalShortcut);

      const foundInModal = registry.findShortcutByKey('?', ['cmd'], 'modal');
      expect(foundInModal).toEqual(globalShortcut);
    });

    it('should prioritize context-specific shortcuts over global ones', () => {
      // Register both global and context-specific shortcuts with same key
      const globalShortcut: KeyboardShortcut = {
        id: 'global_escape',
        key: 'Escape',
        modifiers: [],
        context: 'global',
        action: 'GLOBAL_CANCEL',
        customizable: true,
      };
      
      const listShortcut: KeyboardShortcut = {
        id: 'list_escape',
        key: 'Escape',
        modifiers: [],
        context: 'list',
        action: 'LIST_CANCEL',
        customizable: true,
      };

      const globalCommand = new MockCommand('global_escape', async () => ({ success: true }), () => true);
      const listCommand = new MockCommand('list_escape', async () => ({ success: true }), () => true);
      
      registry.register(globalShortcut, globalCommand);
      registry.register(listShortcut, listCommand);

      // In list context, should find list-specific shortcut
      const foundInList = registry.findShortcutByKey('Escape', [], 'list');
      expect(foundInList).toEqual(listShortcut);

      // In other contexts, should fall back to global shortcut
      const foundInForm = registry.findShortcutByKey('Escape', [], 'form');
      expect(foundInForm).toEqual(globalShortcut);
    });
  });

  describe('getShortcutsForContext', () => {
    it('should return all shortcuts for a specific context', () => {
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

      shortcuts.forEach(shortcut => {
        const command = new MockCommand(
          shortcut.id,
          async () => ({ success: true }),
          () => true
        );
        registry.register(shortcut, command);
      });

      const listShortcuts = registry.getShortcutsForContext('list');
      expect(listShortcuts).toHaveLength(2);
      expect(listShortcuts.map(s => s.id)).toEqual(['copy', 'delete']);

      const formShortcuts = registry.getShortcutsForContext('form');
      expect(formShortcuts).toHaveLength(1);
      expect(formShortcuts[0].id).toBe('save');
    });
  });
});
import { describe, it, expect } from 'vitest';

import type {
  KeyboardShortcut,
  KeyboardContext,
  ContextId,
  Modifier,
  ActionType,
  CommandResult,
} from '../keyboard.types';

describe('Keyboard Types', () => {
  describe('KeyboardShortcut', () => {
    it('should accept valid shortcut configuration', () => {
      const shortcut: KeyboardShortcut = {
        id: 'copy_prompt',
        key: 'C',
        modifiers: ['cmd'],
        context: 'list',
        action: 'COPY_PROMPT',
        customizable: true,
      };

      expect(shortcut.id).toBe('copy_prompt');
      expect(shortcut.modifiers).toContain('cmd');
    });

    it('should support global hotkey flag', () => {
      const globalShortcut: KeyboardShortcut = {
        id: 'activate_app',
        key: 'P',
        modifiers: ['cmd', 'shift'],
        context: 'global',
        action: 'ACTIVATE_APP',
        customizable: false,
        globalHotkey: true,
      };

      expect(globalShortcut.globalHotkey).toBe(true);
    });
  });

  describe('KeyboardContext', () => {
    it('should define context with priority', () => {
      const context: KeyboardContext = {
        id: 'search',
        priority: 2,
      };

      expect(context.id).toBe('search');
      expect(context.priority).toBe(2);
    });

    it('should support parent context', () => {
      const context: KeyboardContext = {
        id: 'form',
        priority: 3,
        parent: 'global',
      };

      expect(context.parent).toBe('global');
    });
  });

  describe('ContextId', () => {
    it('should allow valid context IDs', () => {
      const contexts: ContextId[] = ['global', 'search', 'list', 'form', 'modal'];
      
      contexts.forEach(context => {
        expect(['global', 'search', 'list', 'form', 'modal']).toContain(context);
      });
    });
  });

  describe('Modifier', () => {
    it('should allow valid modifiers', () => {
      const modifiers: Modifier[] = ['cmd', 'shift', 'option', 'ctrl'];
      
      modifiers.forEach(modifier => {
        expect(['cmd', 'shift', 'option', 'ctrl']).toContain(modifier);
      });
    });
  });

  describe('CommandResult', () => {
    it('should represent successful execution', () => {
      const result: CommandResult = {
        success: true,
        data: { promptCopied: true },
      };

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should represent failed execution with error', () => {
      const result: CommandResult = {
        success: false,
        error: 'Command not available in current context',
      };

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
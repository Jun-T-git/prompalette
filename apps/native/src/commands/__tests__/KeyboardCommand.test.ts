import { describe, it, expect } from 'vitest';

import type { KeyboardContext, CommandResult } from '../../types/keyboard.types';
import { BaseKeyboardCommand } from '../KeyboardCommand';

describe('KeyboardCommand', () => {
  describe('BaseKeyboardCommand', () => {
    class TestCommand extends BaseKeyboardCommand {
      constructor() {
        super('test_command');
      }

      protected async doExecute(): Promise<CommandResult> {
        return { success: true, data: 'executed' };
      }

      canExecute(context: KeyboardContext): boolean {
        return context.id === 'list';
      }
    }

    it('should have an id', () => {
      const command = new TestCommand();
      expect(command.id).toBe('test_command');
    });

    it('should execute when canExecute returns true', async () => {
      const command = new TestCommand();

      const result = await command.execute();
      expect(result.success).toBe(true);
      expect(result.data).toBe('executed');
    });

    it('should check context with canExecute', () => {
      const command = new TestCommand();
      const validContext: KeyboardContext = { id: 'list', priority: 1 };
      const invalidContext: KeyboardContext = { id: 'form', priority: 2 };

      expect(command.canExecute(validContext)).toBe(true);
      expect(command.canExecute(invalidContext)).toBe(false);
    });

    it('should support undo operation', async () => {
      class UndoableCommand extends BaseKeyboardCommand {
        private undoCalled = false;

        constructor() {
          super('undoable_command');
        }

        protected async doExecute(): Promise<CommandResult> {
          return { success: true };
        }

        canExecute(): boolean {
          return true;
        }

        async undo(): Promise<void> {
          this.undoCalled = true;
        }

        get wasUndoCalled(): boolean {
          return this.undoCalled;
        }
      }

      const command = new UndoableCommand();
      await command.execute();
      await command.undo();

      expect(command.wasUndoCalled).toBe(true);
    });
  });

  describe('Command with validation', () => {
    class ValidatedCommand extends BaseKeyboardCommand {
      constructor(private validator: () => boolean) {
        super('validated_command');
      }

      protected async doExecute(): Promise<CommandResult> {
        if (!this.validator()) {
          return { success: false, error: 'Validation failed' };
        }
        return { success: true };
      }

      canExecute(): boolean {
        return true;
      }
    }

    it('should fail execution when validation fails', async () => {
      const command = new ValidatedCommand(() => false);
      const result = await command.execute();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation failed');
    });

    it('should succeed execution when validation passes', async () => {
      const command = new ValidatedCommand(() => true);
      const result = await command.execute();

      expect(result.success).toBe(true);
    });
  });
});
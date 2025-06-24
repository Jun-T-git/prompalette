import type { KeyboardContext, CommandResult } from '../types/keyboard.types';

export interface KeyboardCommand {
  id: string;
  execute: () => Promise<CommandResult>;
  canExecute: (context: KeyboardContext) => boolean;
  undo?: () => Promise<void>;
}

export abstract class BaseKeyboardCommand implements KeyboardCommand {
  constructor(public readonly id: string) {}

  async execute(): Promise<CommandResult> {
    try {
      return await this.doExecute();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  abstract canExecute(context: KeyboardContext): boolean;

  protected abstract doExecute(): Promise<CommandResult>;

  async undo(): Promise<void> {
    // Default implementation does nothing
    // Override in subclasses for undoable commands
  }
}
import type { CommandResult, KeyboardContext } from '../types/keyboard.types';

import { BaseKeyboardCommand } from './KeyboardCommand';

export type AppFunction = () => Promise<void> | void;

export class NewPromptCommand extends BaseKeyboardCommand {
  constructor(private newPrompt: AppFunction) {
    super('new_prompt');
  }

  protected async doExecute(): Promise<CommandResult> {
    await this.newPrompt();
    return { success: true, data: { action: 'new_prompt' } };
  }

  canExecute(context: KeyboardContext): boolean {
    // Available everywhere except form editing to avoid conflicts
    return context.id !== 'form';
  }
}

export class EditPromptCommand extends BaseKeyboardCommand {
  constructor(private editPrompt: AppFunction) {
    super('edit_prompt');
  }

  protected async doExecute(): Promise<CommandResult> {
    await this.editPrompt();
    return { success: true, data: { action: 'edit_prompt' } };
  }

  canExecute(context: KeyboardContext): boolean {
    // Available everywhere except form editing to avoid conflicts
    return context.id !== 'form';
  }
}

export class SearchFocusCommand extends BaseKeyboardCommand {
  constructor(private searchFocus: AppFunction) {
    super('search_focus');
  }

  protected async doExecute(): Promise<CommandResult> {
    await this.searchFocus();
    return { success: true, data: { action: 'search_focus' } };
  }

  canExecute(_context: KeyboardContext): boolean {
    // Always available - essential shortcut
    return true;
  }
}

export class SaveCommand extends BaseKeyboardCommand {
  private lastSavedData: unknown = null;

  constructor(private save: AppFunction) {
    super('save');
  }

  protected async doExecute(): Promise<CommandResult> {
    // Store current state for potential undo
    this.lastSavedData = { timestamp: Date.now() };

    await this.save();
    return { success: true, data: { action: 'save' } };
  }

  canExecute(context: KeyboardContext): boolean {
    // Only available in form context
    return context.id === 'form';
  }

  override async undo(): Promise<void> {
    // Undo save operation if possible
    if (this.lastSavedData) {
      // Implementation would depend on the specific save operation
      // For now, just clear the stored data
      this.lastSavedData = null;
    }
  }
}

export class ShowHelpCommand extends BaseKeyboardCommand {
  constructor(private showHelp: AppFunction) {
    super('show_help');
  }

  protected async doExecute(): Promise<CommandResult> {
    await this.showHelp();
    return { success: true, data: { action: 'show_help' } };
  }

  canExecute(_context: KeyboardContext): boolean {
    // Always available - essential shortcut
    return true;
  }
}

export class ShowSettingsCommand extends BaseKeyboardCommand {
  constructor(private showSettings: AppFunction) {
    super('show_settings');
  }

  protected async doExecute(): Promise<CommandResult> {
    await this.showSettings();
    return { success: true, data: { action: 'show_settings' } };
  }

  canExecute(_context: KeyboardContext): boolean {
    // Always available - essential shortcut
    return true;
  }
}


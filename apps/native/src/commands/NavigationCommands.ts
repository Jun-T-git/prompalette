import type { KeyboardContext, CommandResult } from '../types/keyboard.types';

import { BaseKeyboardCommand } from './KeyboardCommand';

export type NavigationFunction = () => Promise<void> | void;
export type ConfirmFunction = () => Promise<void> | void;
export type CancelFunction = () => Promise<void> | void;

export class NavigateUpCommand extends BaseKeyboardCommand {
  constructor(private navigateUp: NavigationFunction) {
    super('navigate_up');
  }

  protected async doExecute(): Promise<CommandResult> {
    await this.navigateUp();
    return { success: true, data: { direction: 'up' } };
  }

  canExecute(context: KeyboardContext): boolean {
    return ['list', 'search'].includes(context.id);
  }
}

export class NavigateDownCommand extends BaseKeyboardCommand {
  constructor(private navigateDown: NavigationFunction) {
    super('navigate_down');
  }

  protected async doExecute(): Promise<CommandResult> {
    await this.navigateDown();
    return { success: true, data: { direction: 'down' } };
  }

  canExecute(context: KeyboardContext): boolean {
    return ['list', 'search'].includes(context.id);
  }
}

export class SelectFirstCommand extends BaseKeyboardCommand {
  constructor(private selectFirst: NavigationFunction) {
    super('select_first');
  }

  protected async doExecute(): Promise<CommandResult> {
    await this.selectFirst();
    return { success: true, data: { position: 'first' } };
  }

  canExecute(context: KeyboardContext): boolean {
    return context.id === 'list';
  }
}

export class SelectLastCommand extends BaseKeyboardCommand {
  constructor(private selectLast: NavigationFunction) {
    super('select_last');
  }

  protected async doExecute(): Promise<CommandResult> {
    await this.selectLast();
    return { success: true, data: { position: 'last' } };
  }

  canExecute(context: KeyboardContext): boolean {
    return context.id === 'list';
  }
}

export class ConfirmCommand extends BaseKeyboardCommand {
  constructor(private confirm: ConfirmFunction) {
    super('confirm');
  }

  protected async doExecute(): Promise<CommandResult> {
    await this.confirm();
    return { success: true, data: { action: 'confirmed' } };
  }

  canExecute(_context: KeyboardContext): boolean {
    // Confirm is available in all contexts
    return true;
  }
}

export class CancelCommand extends BaseKeyboardCommand {
  private lastCancelledAction: any = null;

  constructor(private cancel: CancelFunction) {
    super('cancel');
  }

  protected async doExecute(): Promise<CommandResult> {
    // Store state for potential undo
    this.lastCancelledAction = { timestamp: Date.now() };
    
    await this.cancel();
    return { success: true, data: { action: 'cancelled' } };
  }

  canExecute(_context: KeyboardContext): boolean {
    // Cancel is available in all contexts
    return true;
  }

  override async undo(): Promise<void> {
    // Undo cancel operation if possible
    if (this.lastCancelledAction) {
      // Implementation would depend on the specific cancel action
      // For now, just clear the stored action
      this.lastCancelledAction = null;
    }
  }
}
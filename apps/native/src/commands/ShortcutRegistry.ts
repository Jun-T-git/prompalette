import type { KeyboardShortcut, KeyboardContext, CommandResult, ContextId, Modifier } from '../types/keyboard.types';

import type { KeyboardCommand } from './KeyboardCommand';

export class ShortcutRegistry {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private commands: Map<string, KeyboardCommand> = new Map();

  register(shortcut: KeyboardShortcut, command: KeyboardCommand): void {
    if (this.shortcuts.has(shortcut.id)) {
      throw new Error(`Shortcut with id "${shortcut.id}" already registered`);
    }

    this.shortcuts.set(shortcut.id, shortcut);
    this.commands.set(shortcut.id, command);
  }

  async execute(shortcutId: string, context: KeyboardContext): Promise<CommandResult> {
    const command = this.commands.get(shortcutId);
    
    if (!command) {
      return { 
        success: false, 
        error: `Shortcut "${shortcutId}" not found` 
      };
    }

    if (!command.canExecute(context)) {
      return { 
        success: false, 
        error: 'Command not available in current context' 
      };
    }

    return command.execute();
  }

  getShortcut(id: string): KeyboardShortcut | undefined {
    return this.shortcuts.get(id);
  }

  findShortcutByKey(
    key: string, 
    modifiers: Modifier[], 
    context: ContextId
  ): KeyboardShortcut | null {
    // First, look for shortcuts in the specific context
    for (const [_, shortcut] of this.shortcuts) {
      if (
        shortcut.key === key &&
        shortcut.context === context &&
        this.modifiersMatch(shortcut.modifiers, modifiers)
      ) {
        return shortcut;
      }
    }
    
    // If not found, look for global shortcuts (available in all contexts)
    for (const [_, shortcut] of this.shortcuts) {
      if (
        shortcut.key === key &&
        shortcut.context === 'global' &&
        this.modifiersMatch(shortcut.modifiers, modifiers)
      ) {
        return shortcut;
      }
    }
    
    return null;
  }

  getShortcutsForContext(context: ContextId): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values()).filter(
      shortcut => shortcut.context === context
    );
  }

  private modifiersMatch(modifiers1: Modifier[], modifiers2: Modifier[]): boolean {
    if (modifiers1.length !== modifiers2.length) {
      return false;
    }

    const sorted1 = [...modifiers1].sort();
    const sorted2 = [...modifiers2].sort();

    return sorted1.every((mod, index) => mod === sorted2[index]);
  }
}
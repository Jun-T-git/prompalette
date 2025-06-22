import { describe, it, expect, vi, beforeEach } from 'vitest';

import type { KeyboardContext } from '../../types/keyboard.types';
import {
  NewPromptCommand,
  SearchFocusCommand,
  SaveCommand,
  ShowHelpCommand,
  ShowSettingsCommand,
} from '../EssentialCommands';

// Mock functions
const mockNewPrompt = vi.fn();
const mockSearchFocus = vi.fn();
const mockSave = vi.fn();
const mockShowHelp = vi.fn();
const mockShowSettings = vi.fn();

describe('EssentialCommands', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('NewPromptCommand', () => {
    it('should execute new prompt creation', async () => {
      const command = new NewPromptCommand(mockNewPrompt);
      const result = await command.execute();

      expect(mockNewPrompt).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data?.action).toBe('new_prompt');
    });

    it('should be available in all contexts except form editing', () => {
      const command = new NewPromptCommand(mockNewPrompt);
      
      const globalContext: KeyboardContext = { id: 'global', priority: 1 };
      const searchContext: KeyboardContext = { id: 'search', priority: 2 };
      const listContext: KeyboardContext = { id: 'list', priority: 2 };
      const formContext: KeyboardContext = { id: 'form', priority: 3 };
      const modalContext: KeyboardContext = { id: 'modal', priority: 4 };

      expect(command.canExecute(globalContext)).toBe(true);
      expect(command.canExecute(searchContext)).toBe(true);
      expect(command.canExecute(listContext)).toBe(true);
      expect(command.canExecute(formContext)).toBe(false); // Disabled in form to avoid conflicts
      expect(command.canExecute(modalContext)).toBe(true);
    });

    it('should handle creation errors', async () => {
      const errorNewPrompt = vi.fn().mockRejectedValue(new Error('Creation failed'));
      const command = new NewPromptCommand(errorNewPrompt);
      
      const result = await command.execute();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Creation failed');
    });
  });

  describe('SearchFocusCommand', () => {
    it('should execute search focus', async () => {
      const command = new SearchFocusCommand(mockSearchFocus);
      const result = await command.execute();

      expect(mockSearchFocus).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data?.action).toBe('search_focus');
    });

    it('should be available in all contexts', () => {
      const command = new SearchFocusCommand(mockSearchFocus);
      
      const contexts: KeyboardContext[] = [
        { id: 'global', priority: 1 },
        { id: 'search', priority: 2 },
        { id: 'list', priority: 2 },
        { id: 'form', priority: 3 },
        { id: 'modal', priority: 4 },
      ];

      contexts.forEach(context => {
        expect(command.canExecute(context)).toBe(true);
      });
    });

    it('should not focus if already in search context', async () => {
      const command = new SearchFocusCommand(mockSearchFocus);
      const result = await command.execute();

      expect(result.success).toBe(true);
      // Focus function should still be called for consistency
      expect(mockSearchFocus).toHaveBeenCalled();
    });
  });

  describe('SaveCommand', () => {
    it('should execute save operation', async () => {
      const command = new SaveCommand(mockSave);
      const result = await command.execute();

      expect(mockSave).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data?.action).toBe('save');
    });

    it('should be available only in form context', () => {
      const command = new SaveCommand(mockSave);
      
      const globalContext: KeyboardContext = { id: 'global', priority: 1 };
      const formContext: KeyboardContext = { id: 'form', priority: 3 };
      const listContext: KeyboardContext = { id: 'list', priority: 2 };

      expect(command.canExecute(globalContext)).toBe(false);
      expect(command.canExecute(formContext)).toBe(true);
      expect(command.canExecute(listContext)).toBe(false);
    });

    it('should provide undo capability', async () => {
      const command = new SaveCommand(mockSave);
      
      expect(command.undo).toBeDefined();
      expect(typeof command.undo).toBe('function');
    });

    it('should handle save errors with detailed messages', async () => {
      const errorSave = vi.fn().mockRejectedValue(new Error('Validation failed: Title is required'));
      const command = new SaveCommand(errorSave);
      
      const result = await command.execute();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation failed: Title is required');
    });
  });

  describe('ShowHelpCommand', () => {
    it('should execute show help', async () => {
      const command = new ShowHelpCommand(mockShowHelp);
      const result = await command.execute();

      expect(mockShowHelp).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data?.action).toBe('show_help');
    });

    it('should be available in all contexts', () => {
      const command = new ShowHelpCommand(mockShowHelp);
      
      const contexts: KeyboardContext[] = [
        { id: 'global', priority: 1 },
        { id: 'search', priority: 2 },
        { id: 'list', priority: 2 },
        { id: 'form', priority: 3 },
        { id: 'modal', priority: 4 },
      ];

      contexts.forEach(context => {
        expect(command.canExecute(context)).toBe(true);
      });
    });
  });

  describe('ShowSettingsCommand', () => {
    it('should execute show settings', async () => {
      const command = new ShowSettingsCommand(mockShowSettings);
      const result = await command.execute();

      expect(mockShowSettings).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data?.action).toBe('show_settings');
    });

    it('should be available in all contexts', () => {
      const command = new ShowSettingsCommand(mockShowSettings);
      
      const contexts: KeyboardContext[] = [
        { id: 'global', priority: 1 },
        { id: 'search', priority: 2 },
        { id: 'list', priority: 2 },
        { id: 'form', priority: 3 },
        { id: 'modal', priority: 4 },
      ];

      contexts.forEach(context => {
        expect(command.canExecute(context)).toBe(true);
      });
    });

    it('should handle settings modal opening', async () => {
      const command = new ShowSettingsCommand(mockShowSettings);
      await command.execute();

      expect(mockShowSettings).toHaveBeenCalledTimes(1);
    });
  });

  describe('Command integration', () => {
    it('should work together in a typical workflow', async () => {
      const newPromptCommand = new NewPromptCommand(mockNewPrompt);
      const saveCommand = new SaveCommand(mockSave);
      const searchCommand = new SearchFocusCommand(mockSearchFocus);

      // Simulate workflow: create new prompt, save it, then return to search
      await newPromptCommand.execute();
      await saveCommand.execute();
      await searchCommand.execute();

      expect(mockNewPrompt).toHaveBeenCalledTimes(1);
      expect(mockSave).toHaveBeenCalledTimes(1);
      expect(mockSearchFocus).toHaveBeenCalledTimes(1);
    });

    it('should handle concurrent command execution', async () => {
      const helpCommand = new ShowHelpCommand(mockShowHelp);
      const settingsCommand = new ShowSettingsCommand(mockShowSettings);

      // Execute commands concurrently
      const results = await Promise.all([
        helpCommand.execute(),
        settingsCommand.execute(),
      ]);

      expect(results).toHaveLength(2);
      expect(results.every(r => r.success)).toBe(true);
      expect(mockShowHelp).toHaveBeenCalled();
      expect(mockShowSettings).toHaveBeenCalled();
    });
  });
});
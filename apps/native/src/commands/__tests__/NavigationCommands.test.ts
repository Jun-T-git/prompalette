import { describe, it, expect, vi, beforeEach } from 'vitest';

import type { KeyboardContext } from '../../types/keyboard.types';
import {
  NavigateUpCommand,
  NavigateDownCommand,
  SelectFirstCommand,
  SelectLastCommand,
  ConfirmCommand,
  CancelCommand,
} from '../NavigationCommands';

// Mock navigation functions
const mockNavigateUp = vi.fn();
const mockNavigateDown = vi.fn();
const mockSelectFirst = vi.fn();
const mockSelectLast = vi.fn();
const mockConfirm = vi.fn();
const mockCancel = vi.fn();

describe('NavigationCommands', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('NavigateUpCommand', () => {
    it('should execute navigation up', async () => {
      const command = new NavigateUpCommand(mockNavigateUp);
      const result = await command.execute();

      expect(mockNavigateUp).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should be available in list and search contexts', () => {
      const command = new NavigateUpCommand(mockNavigateUp);
      
      const listContext: KeyboardContext = { id: 'list', priority: 2 };
      const searchContext: KeyboardContext = { id: 'search', priority: 2 };
      const formContext: KeyboardContext = { id: 'form', priority: 3 };

      expect(command.canExecute(listContext)).toBe(true);
      expect(command.canExecute(searchContext)).toBe(true);
      expect(command.canExecute(formContext)).toBe(false);
    });

    it('should handle navigation errors', async () => {
      const errorNavigateUp = vi.fn().mockRejectedValue(new Error('Navigation failed'));
      const command = new NavigateUpCommand(errorNavigateUp);
      
      const result = await command.execute();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Navigation failed');
    });
  });

  describe('NavigateDownCommand', () => {
    it('should execute navigation down', async () => {
      const command = new NavigateDownCommand(mockNavigateDown);
      const result = await command.execute();

      expect(mockNavigateDown).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should be available in list and search contexts', () => {
      const command = new NavigateDownCommand(mockNavigateDown);
      
      const listContext: KeyboardContext = { id: 'list', priority: 2 };
      const searchContext: KeyboardContext = { id: 'search', priority: 2 };
      const modalContext: KeyboardContext = { id: 'modal', priority: 4 };

      expect(command.canExecute(listContext)).toBe(true);
      expect(command.canExecute(searchContext)).toBe(true);
      expect(command.canExecute(modalContext)).toBe(false);
    });
  });

  describe('SelectFirstCommand', () => {
    it('should execute select first', async () => {
      const command = new SelectFirstCommand(mockSelectFirst);
      const result = await command.execute();

      expect(mockSelectFirst).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should be available only in list context', () => {
      const command = new SelectFirstCommand(mockSelectFirst);
      
      const listContext: KeyboardContext = { id: 'list', priority: 2 };
      const searchContext: KeyboardContext = { id: 'search', priority: 2 };

      expect(command.canExecute(listContext)).toBe(true);
      expect(command.canExecute(searchContext)).toBe(false);
    });
  });

  describe('SelectLastCommand', () => {
    it('should execute select last', async () => {
      const command = new SelectLastCommand(mockSelectLast);
      const result = await command.execute();

      expect(mockSelectLast).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should be available only in list context', () => {
      const command = new SelectLastCommand(mockSelectLast);
      
      const listContext: KeyboardContext = { id: 'list', priority: 2 };
      const globalContext: KeyboardContext = { id: 'global', priority: 1 };

      expect(command.canExecute(listContext)).toBe(true);
      expect(command.canExecute(globalContext)).toBe(false);
    });
  });

  describe('ConfirmCommand', () => {
    it('should execute confirm action', async () => {
      const command = new ConfirmCommand(mockConfirm);
      const result = await command.execute();

      expect(mockConfirm).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should be available in all contexts', () => {
      const command = new ConfirmCommand(mockConfirm);
      
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

    it('should pass context-specific data to confirm function', async () => {
      const contextAwareConfirm = vi.fn();
      const command = new ConfirmCommand(contextAwareConfirm);
      
      await command.execute();

      expect(contextAwareConfirm).toHaveBeenCalled();
    });
  });

  describe('CancelCommand', () => {
    it('should execute cancel action', async () => {
      const command = new CancelCommand(mockCancel);
      const result = await command.execute();

      expect(mockCancel).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should be available in all contexts', () => {
      const command = new CancelCommand(mockCancel);
      
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

    it('should provide undo capability', async () => {
      const command = new CancelCommand(mockCancel);
      
      expect(command.undo).toBeDefined();
      expect(typeof command.undo).toBe('function');
    });
  });

  describe('Command error handling', () => {
    it('should handle function errors gracefully', async () => {
      const errorFunction = vi.fn().mockRejectedValue(new Error('Test error'));
      const command = new NavigateUpCommand(errorFunction);
      
      const result = await command.execute();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Test error');
    });

    it('should handle non-Error exceptions', async () => {
      const errorFunction = vi.fn().mockRejectedValue('String error');
      const command = new NavigateDownCommand(errorFunction);
      
      const result = await command.execute();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error occurred');
    });
  });
});
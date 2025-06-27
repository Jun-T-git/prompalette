import { describe, expect, it, vi } from 'vitest';

import type { KeyboardContext } from '../../types/keyboard.types';
import { SelectPaletteCommand } from '../EssentialCommands';

describe('SelectPaletteCommand', () => {
  const mockSelectPalette = vi.fn();
  const globalContext: KeyboardContext = { id: 'global', priority: 1 };
  const formContext: KeyboardContext = { id: 'form', priority: 1 };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should execute palette selection with correct position', async () => {
    const command = new SelectPaletteCommand(mockSelectPalette, 1);
    
    const result = await command.execute();
    
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ action: 'select_palette', position: 1 });
    expect(mockSelectPalette).toHaveBeenCalledWith(1);
  });

  it('should execute palette selection for position 10 (key 0)', async () => {
    const command = new SelectPaletteCommand(mockSelectPalette, 10);
    
    const result = await command.execute();
    
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ action: 'select_palette', position: 10 });
    expect(mockSelectPalette).toHaveBeenCalledWith(10);
  });

  it('should be available in global context', () => {
    const command = new SelectPaletteCommand(mockSelectPalette, 1);
    
    expect(command.canExecute(globalContext)).toBe(true);
  });

  it('should not be available in form context', () => {
    const command = new SelectPaletteCommand(mockSelectPalette, 1);
    
    expect(command.canExecute(formContext)).toBe(false);
  });

  it('should create unique command id for each position', () => {
    const command1 = new SelectPaletteCommand(mockSelectPalette, 1);
    const command2 = new SelectPaletteCommand(mockSelectPalette, 2);
    
    expect(command1.id).toBe('select_palette_1');
    expect(command2.id).toBe('select_palette_2');
  });

  it('should handle async palette selection function', async () => {
    const asyncSelectPalette = vi.fn().mockResolvedValue(undefined);
    const command = new SelectPaletteCommand(asyncSelectPalette, 3);
    
    const result = await command.execute();
    
    expect(result.success).toBe(true);
    expect(asyncSelectPalette).toHaveBeenCalledWith(3);
  });
});
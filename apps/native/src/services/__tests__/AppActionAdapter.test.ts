import { describe, it, expect, vi, beforeEach } from 'vitest';

import { AppActionAdapter } from '../AppActionAdapter';

// Mock app functions
const mockPromptStore = {
  selectedPromptIndex: 0,
  filteredPrompts: [
    { id: '1', title: 'Test Prompt 1', content: 'Content 1' },
    { id: '2', title: 'Test Prompt 2', content: 'Content 2' },
    { id: '3', title: 'Test Prompt 3', content: 'Content 3' },
  ],
  selectPrompt: vi.fn(),
  navigateUp: vi.fn(),
  navigateDown: vi.fn(),
  selectFirst: vi.fn(),
  selectLast: vi.fn(),
  copySelectedPrompt: vi.fn(),
  copySelectedPromptAndClose: vi.fn(),
};

const mockModalStore = {
  openHelp: vi.fn(),
  openSettings: vi.fn(),
  openNewPrompt: vi.fn(),
  closeModal: vi.fn(),
  hideWindow: vi.fn(),
};

const mockSearchStore = {
  focusSearch: vi.fn(),
  clearSearch: vi.fn(),
};

const mockFormStore = {
  saveForm: vi.fn(),
  cancelForm: vi.fn(),
};

describe('AppActionAdapter', () => {
  let adapter: AppActionAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset to default values
    mockPromptStore.selectedPromptIndex = 0;
    mockPromptStore.filteredPrompts = [
      { id: '1', title: 'Test Prompt 1', content: 'Content 1' },
      { id: '2', title: 'Test Prompt 2', content: 'Content 2' },
      { id: '3', title: 'Test Prompt 3', content: 'Content 3' },
    ];
    
    adapter = new AppActionAdapter({
      promptStore: mockPromptStore,
      modalStore: mockModalStore,
      searchStore: mockSearchStore,
      formStore: mockFormStore,
    });
  });

  describe('Navigation Actions', () => {
    it('should navigate up in prompt list', async () => {
      await adapter.navigateUp();
      expect(mockPromptStore.navigateUp).toHaveBeenCalled();
    });

    it('should navigate down in prompt list', async () => {
      await adapter.navigateDown();
      expect(mockPromptStore.navigateDown).toHaveBeenCalled();
    });

    it('should select first prompt', async () => {
      await adapter.selectFirst();
      expect(mockPromptStore.selectFirst).toHaveBeenCalled();
    });

    it('should select last prompt', async () => {
      await adapter.selectLast();
      expect(mockPromptStore.selectLast).toHaveBeenCalled();
    });
  });

  describe('Essential Actions', () => {
    it('should open new prompt modal', async () => {
      await adapter.newPrompt();
      expect(mockModalStore.openNewPrompt).toHaveBeenCalled();
    });

    it('should focus search input', async () => {
      await adapter.searchFocus();
      expect(mockSearchStore.focusSearch).toHaveBeenCalled();
    });

    it('should show help modal', async () => {
      await adapter.showHelp();
      expect(mockModalStore.openHelp).toHaveBeenCalled();
    });

    it('should show settings modal', async () => {
      await adapter.showSettings();
      expect(mockModalStore.openSettings).toHaveBeenCalled();
    });

    it('should save form', async () => {
      await adapter.save();
      expect(mockFormStore.saveForm).toHaveBeenCalled();
    });
  });

  describe('Universal Actions', () => {
    it('should handle confirm action based on context', async () => {
      // Mock context where a prompt is selected
      mockPromptStore.selectedPromptIndex = 1;
      
      await adapter.confirm();
      expect(mockPromptStore.copySelectedPromptAndClose).toHaveBeenCalled();
    });

    it('should handle cancel action', async () => {
      await adapter.cancel();
      expect(mockModalStore.hideWindow).toHaveBeenCalled();
    });

    it('should clear search when canceling with active search', async () => {
      mockSearchStore.hasActiveSearch = vi.fn().mockReturnValue(true);
      
      await adapter.cancel();
      expect(mockSearchStore.clearSearch).toHaveBeenCalled();
    });
  });

  describe('Context-aware Actions', () => {
    it('should copy selected prompt', async () => {
      await adapter.copyPrompt();
      expect(mockPromptStore.copySelectedPrompt).toHaveBeenCalled();
    });

    it('should handle copy when no prompt is selected', async () => {
      mockPromptStore.selectedPromptIndex = -1;
      
      const result = await adapter.copyPrompt();
      expect(result).toBeUndefined();
      expect(mockPromptStore.copySelectedPrompt).not.toHaveBeenCalled();
    });

    it('should delete selected prompt with confirmation', async () => {
      mockPromptStore.deletePrompt = vi.fn();
      const confirmSpy = vi.fn().mockReturnValue(true);
      vi.stubGlobal('confirm', confirmSpy);
      
      await adapter.deletePrompt();
      expect(confirmSpy).toHaveBeenCalled();
      expect(mockPromptStore.deletePrompt).toHaveBeenCalled();
    });

    it('should not delete prompt when user cancels confirmation', async () => {
      mockPromptStore.deletePrompt = vi.fn();
      const confirmSpy = vi.fn().mockReturnValue(false);
      vi.stubGlobal('confirm', confirmSpy);
      
      await adapter.deletePrompt();
      expect(confirmSpy).toHaveBeenCalled();
      expect(mockPromptStore.deletePrompt).not.toHaveBeenCalled();
    });

    it('should edit selected prompt', async () => {
      mockModalStore.openEditPrompt = vi.fn();
      
      await adapter.editPrompt();
      expect(mockModalStore.openEditPrompt).toHaveBeenCalledWith(mockPromptStore.filteredPrompts[0]);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors in navigation gracefully', async () => {
      mockPromptStore.navigateUp.mockRejectedValue(new Error('Navigation failed'));
      
      await expect(adapter.navigateUp()).rejects.toThrow('Navigation failed');
    });

    it('should handle errors in modal opening', async () => {
      mockModalStore.openHelp.mockRejectedValue(new Error('Modal failed'));
      
      await expect(adapter.showHelp()).rejects.toThrow('Modal failed');
    });

    it('should provide meaningful error messages', async () => {
      mockFormStore.saveForm.mockRejectedValue(new Error('Validation failed'));
      
      try {
        await adapter.save();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Validation failed');
      }
    });
  });

  describe('State Integration', () => {
    it('should react to prompt store state changes', () => {
      mockPromptStore.selectedPromptIndex = 2;
      
      expect(adapter.getSelectedPrompt()).toEqual(mockPromptStore.filteredPrompts[2]);
    });

    it('should handle empty prompt list', () => {
      mockPromptStore.filteredPrompts = [];
      mockPromptStore.selectedPromptIndex = 0;
      
      expect(adapter.getSelectedPrompt()).toBeUndefined();
    });

    it('should provide current context information', () => {
      const context = adapter.getCurrentContext();
      
      expect(context).toHaveProperty('hasSelectedPrompt');
      expect(context).toHaveProperty('hasActiveSearch');
      expect(context).toHaveProperty('totalPrompts');
    });
  });
});
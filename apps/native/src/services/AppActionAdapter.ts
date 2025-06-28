import type { Prompt } from '../types';

export interface PromptStore {
  selectedPromptIndex: number;
  filteredPrompts: Prompt[];
  selectPrompt: (index: number) => void;
  navigateUp: () => void;
  navigateDown: () => void;
  selectFirst: () => void;
  selectLast: () => void;
  copySelectedPrompt: () => Promise<void>;
  copySelectedPromptAndClose: () => Promise<void>;
  deletePrompt?: (promptId: string) => Promise<void>;
}

export interface ModalStore {
  openHelp: () => void;
  openSettings: () => void;
  openNewPrompt: () => void;
  openEditPrompt?: (prompt: Prompt) => void;
  openDeleteConfirm?: (promptId: string, promptTitle: string) => void;
  closeModal: () => void;
  hideWindow: () => Promise<void>;
  hasOpenModal: () => boolean;
}

export interface SearchStore {
  focusSearch: () => void;
  clearSearch: () => void;
  hasActiveSearch?: () => boolean;
}

export interface PaletteStore {
  selectPinnedPrompt: (position: number) => void;
}

export interface FormStore {
  saveForm: () => Promise<void>;
  cancelForm: () => void;
}

export interface AppStores {
  promptStore: PromptStore;
  modalStore: ModalStore;
  searchStore: SearchStore;
  formStore: FormStore;
  paletteStore: PaletteStore;
}

export interface ContextProvider {
  activeContext: string;
}

export interface AppContext {
  hasSelectedPrompt: boolean;
  hasActiveSearch: boolean;
  totalPrompts: number;
  selectedPromptIndex: number;
}

export class AppActionAdapter {
  constructor(
    private stores: AppStores,
    private contextProvider?: ContextProvider
  ) {}

  // Navigation Actions
  async navigateUp(): Promise<void> {
    return this.stores.promptStore.navigateUp();
  }

  async navigateDown(): Promise<void> {
    return this.stores.promptStore.navigateDown();
  }

  async selectFirst(): Promise<void> {
    return this.stores.promptStore.selectFirst();
  }

  async selectLast(): Promise<void> {
    return this.stores.promptStore.selectLast();
  }

  // Essential Actions
  async newPrompt(): Promise<void> {
    return this.stores.modalStore.openNewPrompt();
  }

  async searchFocus(): Promise<void> {
    return this.stores.searchStore.focusSearch();
  }

  async showHelp(): Promise<void> {
    return this.stores.modalStore.openHelp();
  }

  async showSettings(): Promise<void> {
    return this.stores.modalStore.openSettings();
  }

  async save(): Promise<void> {
    // Save is now handled by the form component itself
    return this.stores.formStore.saveForm();
  }

  // Universal Actions
  async confirm(): Promise<void> {
    // Context-aware confirm action
    const context = this.getCurrentContext();
    
    if (context.hasSelectedPrompt) {
      return this.stores.promptStore.copySelectedPromptAndClose();
    }
    
    // Default: do nothing or could trigger save in form context
  }

  async cancel(): Promise<void> {
    // Check if there's an active search to clear first
    if (this.stores.searchStore.hasActiveSearch?.()) {
      this.stores.searchStore.clearSearch();
      return;
    }
    
    // Check current context to determine if modals are open
    const activeContext = this.contextProvider?.activeContext || 'list';
    
    if (activeContext === 'form' || activeContext === 'modal') {
      // Close any open modal/form
      this.stores.modalStore.closeModal();
      return;
    }
    
    // If in list context with no active search, hide the window to background
    await this.stores.modalStore.hideWindow();
  }

  // Context-specific Actions
  async copyPrompt(): Promise<void> {
    const selectedPrompt = this.getSelectedPrompt();
    if (!selectedPrompt) {
      return;
    }
    
    return this.stores.promptStore.copySelectedPrompt();
  }

  async deletePrompt(): Promise<void> {
    const selectedPrompt = this.getSelectedPrompt();
    if (!selectedPrompt) {
      return;
    }

    // Use modal confirmation if available, otherwise fallback to browser confirm
    if (this.stores.modalStore.openDeleteConfirm) {
      this.stores.modalStore.openDeleteConfirm(selectedPrompt.id, selectedPrompt.title);
    } else if (this.stores.promptStore.deletePrompt) {
      // Fallback for environments where modal is not available
      const confirmed = confirm(`プロンプト「${selectedPrompt.title}」を削除しますか？`);
      if (confirmed) {
        return this.stores.promptStore.deletePrompt(selectedPrompt.id);
      }
    }
  }

  async editPrompt(): Promise<void> {
    const selectedPrompt = this.getSelectedPrompt();
    if (!selectedPrompt || !this.stores.modalStore.openEditPrompt) {
      return;
    }
    
    this.stores.modalStore.openEditPrompt(selectedPrompt);
  }

  // Utility Methods
  getSelectedPrompt() {
    const { selectedPromptIndex, filteredPrompts } = this.stores.promptStore;
    
    if (selectedPromptIndex >= 0 && selectedPromptIndex < filteredPrompts.length) {
      return filteredPrompts[selectedPromptIndex];
    }
    
    return undefined;
  }

  getCurrentContext(): AppContext {
    const { selectedPromptIndex, filteredPrompts } = this.stores.promptStore;
    
    return {
      hasSelectedPrompt: selectedPromptIndex >= 0 && selectedPromptIndex < filteredPrompts.length,
      hasActiveSearch: this.stores.searchStore.hasActiveSearch?.() || false,
      totalPrompts: filteredPrompts.length,
      selectedPromptIndex,
    };
  }

  async selectPalette(position: number): Promise<void> {
    this.stores.paletteStore.selectPinnedPrompt(position);
  }
}
import type { AppStores } from '../services/AppActionAdapter';
import { usePromptStore } from '../stores/prompt';

// Real app store adapter that connects to actual Zustand stores
export const createRealAppStores = (
  // Modal state setters from App component
  setShowCreateForm: (show: boolean) => void,
  setShowEditForm: (show: boolean) => void,
  setShowHelpModal: (show: boolean) => void,
  setShowSettings: (show: boolean) => void,
  setSelectedPrompt: (prompt: any) => void,
  sidebarRef: React.RefObject<any>,
  setSearchQuery: (query: string) => void,
  searchQuery: string,
  // Navigation state
  filteredPrompts: any[],
  selectedPrompt: any
): AppStores => {
  return {
    promptStore: {
      get selectedPromptIndex() {
        if (!selectedPrompt || !filteredPrompts) return 0;
        return filteredPrompts.findIndex(p => p.id === selectedPrompt.id) || 0;
      },
      get filteredPrompts() {
        return filteredPrompts;
      },
      selectPrompt: (index: number) => {
        if (filteredPrompts[index]) {
          setSelectedPrompt(filteredPrompts[index]);
        }
      },
      navigateUp: () => {
        if (!filteredPrompts || filteredPrompts.length === 0) return;
        
        const currentIndex = selectedPrompt ? 
          filteredPrompts.findIndex(p => p.id === selectedPrompt.id) : 0;
        const newIndex = currentIndex > 0 ? currentIndex - 1 : filteredPrompts.length - 1;
        setSelectedPrompt(filteredPrompts[newIndex]);
      },
      navigateDown: () => {
        if (!filteredPrompts || filteredPrompts.length === 0) return;
        
        const currentIndex = selectedPrompt ? 
          filteredPrompts.findIndex(p => p.id === selectedPrompt.id) : -1;
        const newIndex = currentIndex < filteredPrompts.length - 1 ? currentIndex + 1 : 0;
        setSelectedPrompt(filteredPrompts[newIndex]);
      },
      selectFirst: () => {
        if (filteredPrompts && filteredPrompts.length > 0) {
          setSelectedPrompt(filteredPrompts[0]);
        }
      },
      selectLast: () => {
        if (filteredPrompts && filteredPrompts.length > 0) {
          setSelectedPrompt(filteredPrompts[filteredPrompts.length - 1]);
        }
      },
      copySelectedPrompt: async () => {
        if (selectedPrompt) {
          // Copy to clipboard
          try {
            await navigator.clipboard.writeText(selectedPrompt.content);
          } catch (error) {
            console.error('Failed to copy to clipboard:', error);
          }
        }
      },
      copySelectedPromptAndClose: async () => {
        if (selectedPrompt) {
          // Copy to clipboard
          try {
            await navigator.clipboard.writeText(selectedPrompt.content);
            
            // Hide window (not close) if in Tauri environment to keep app running in background
            if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
              const { getCurrentWindow } = await import('@tauri-apps/api/window');
              const appWindow = getCurrentWindow();
              await appWindow.hide();
            } else {
              // In E2E test environment, just log success and window hiding
              console.log(`Copied prompt: ${selectedPrompt.title}`);
              console.log('Window hidden to background');
            }
          } catch (error) {
            console.error('Failed to copy to clipboard:', error);
          }
        }
      },
      deletePrompt: async (promptId: string) => {
        const { deletePrompt } = usePromptStore.getState();
        await deletePrompt(promptId);
      },
    },
    modalStore: {
      openHelp: () => {
        setShowHelpModal(true);
      },
      openSettings: () => {
        setShowSettings(true);
      },
      openNewPrompt: () => {
        setShowCreateForm(true);
      },
      openEditPrompt: (prompt: any) => {
        setSelectedPrompt(prompt);
        setShowEditForm(true);
      },
      closeModal: () => {
        setShowCreateForm(false);
        setShowEditForm(false);
        setShowHelpModal(false);
        setShowSettings(false);
      },
      hideWindow: async () => {
        // Hide window to background (keep app running)
        if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
          const { getCurrentWindow } = await import('@tauri-apps/api/window');
          const appWindow = getCurrentWindow();
          await appWindow.hide();
        } else {
          // In E2E test environment, just log window hiding
          console.log('Window hidden to background');
        }
      },
      hasOpenModal: () => {
        // This will be implemented by checking the active context instead
        // Modal contexts will be 'form' or 'modal', not 'list'
        return false; // Simplified for now - will use context check in AppActionAdapter
      },
    },
    searchStore: {
      focusSearch: () => {
        if (sidebarRef.current) {
          sidebarRef.current.focusSearchInput();
        }
      },
      clearSearch: () => {
        setSearchQuery('');
      },
      hasActiveSearch: () => {
        return searchQuery.length > 0;
      },
    },
    formStore: {
      saveForm: async () => {
        // Form save logic will be handled by the form component itself
        // This is just for keyboard shortcuts
      },
      cancelForm: () => {
        setShowCreateForm(false);
        setShowEditForm(false);
      },
    },
  };
};
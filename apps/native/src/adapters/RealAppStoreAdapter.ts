import type { AppStores } from '../services/AppActionAdapter';
import { useFavoritesStore } from '../stores/favorites';
import { usePromptStore } from '../stores/prompt';
import type { Prompt } from '../types';

// Real app store adapter that connects to actual Zustand stores
export const createRealAppStores = (
  // Modal state setters from App component
  setShowCreateForm: (show: boolean) => void,
  setShowEditForm: (show: boolean) => void,
  setShowHelpModal: (show: boolean) => void,
  setShowSettings: (show: boolean) => void,
  setSelectedPrompt: (prompt: Prompt | null) => void,
  sidebarRef: React.RefObject<{ focusSearchInput: () => void }>,
  setSearchQuery: (query: string) => void,
  searchQuery: string,
  // Navigation state
  filteredPrompts: Prompt[],
  selectedPrompt: Prompt | null,
  // Focus management function
  handleFormClose?: () => void
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
        if (!filteredPrompts || filteredPrompts.length === 0) {
          return;
        }
        
        const currentIndex = selectedPrompt ? 
          filteredPrompts.findIndex(p => p.id === selectedPrompt.id) : 0;
        const newIndex = currentIndex > 0 ? currentIndex - 1 : filteredPrompts.length - 1;
        const newPrompt = filteredPrompts[newIndex];
        
        if (newPrompt) {
          setSelectedPrompt(newPrompt);
        }
      },
      navigateDown: () => {
        if (!filteredPrompts || filteredPrompts.length === 0) {
          return;
        }
        
        const currentIndex = selectedPrompt ? 
          filteredPrompts.findIndex(p => p.id === selectedPrompt.id) : -1;
        const newIndex = currentIndex < filteredPrompts.length - 1 ? currentIndex + 1 : 0;
        const newPrompt = filteredPrompts[newIndex];
        
        if (newPrompt) {
          setSelectedPrompt(newPrompt);
        }
      },
      selectFirst: () => {
        if (filteredPrompts && filteredPrompts.length > 0) {
          const firstPrompt = filteredPrompts[0];
          if (firstPrompt) {
            setSelectedPrompt(firstPrompt);
          }
        }
      },
      selectLast: () => {
        if (filteredPrompts && filteredPrompts.length > 0) {
          const lastPrompt = filteredPrompts[filteredPrompts.length - 1];
          if (lastPrompt) {
            setSelectedPrompt(lastPrompt);
          }
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
            
            // Log error for debugging (silent failure for better UX)
            if (error instanceof Error) {
              console.error('Clipboard copy failed:', error.message);
              // TODO: Future enhancement - implement non-blocking toast notification
            }
            
            // Still hide the window even if copy failed
            if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
              try {
                const { getCurrentWindow } = await import('@tauri-apps/api/window');
                const appWindow = getCurrentWindow();
                await appWindow.hide();
              } catch (hideError) {
                console.error('Failed to hide window after copy error:', hideError);
              }
            }
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
      openEditPrompt: (prompt: Prompt) => {
        setSelectedPrompt(prompt);
        setShowEditForm(true);
      },
      closeModal: () => {
        setShowCreateForm(false);
        setShowEditForm(false);
        setShowHelpModal(false);
        setShowSettings(false);
        
        // Always trigger focus management when closing via keyboard - this is likely a form close
        if (handleFormClose) {
          handleFormClose();
        }
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
    paletteStore: {
      selectPinnedPrompt: (position: number) => {
        const { pinnedPrompts } = useFavoritesStore.getState();
        const pinnedPrompt = pinnedPrompts[position - 1]; // position is 1-based
        
        if (pinnedPrompt) {
          setSelectedPrompt(pinnedPrompt);
        }
      },
    },
  };
};
import { useState, useEffect, useCallback } from 'react';

import type { Prompt } from '../types';

export interface SelectionIntent {
  type: 'preserve' | 'select-new' | 'select-edited' | 'auto';
  targetId?: string;
}

interface UseSmartSelectionProps {
  filteredPrompts: Prompt[];
  selectedPrompt: Prompt | null;
  searchQuery: string;
  setSelectedPrompt: (prompt: Prompt | null) => void;
}

/**
 * Smart selection management hook
 * Handles intelligent prompt selection based on user actions and intents
 */
export const useSmartSelection = ({
  filteredPrompts,
  selectedPrompt,
  searchQuery,
  setSelectedPrompt,
}: UseSmartSelectionProps) => {
  const [selectionIntent, setSelectionIntent] = useState<SelectionIntent | null>(null);

  // Smart selection management with user intent awareness
  useEffect(() => {
    if (filteredPrompts.length === 0) {
      // Clear selection when no results
      if (searchQuery) {
        setSelectedPrompt(null);
      }
      setSelectionIntent(null); // Clear any pending intent
      return;
    }

    // Handle explicit selection intent
    if (selectionIntent) {
      switch (selectionIntent.type) {
        case 'select-new':
        case 'select-edited':
          if (selectionIntent.targetId) {
            const targetPrompt = filteredPrompts.find(p => p.id === selectionIntent.targetId);
            if (targetPrompt) {
              setSelectedPrompt(targetPrompt);
              setSelectionIntent(null);
              return;
            } else {
              // Target prompt not found in filtered list, fall back to first prompt
              setSelectedPrompt(filteredPrompts[0] || null);
              setSelectionIntent(null);
              return;
            }
          }
          break;
        case 'preserve':
          // Try to preserve current selection if it's valid
          if (selectedPrompt && filteredPrompts.some(p => p.id === selectedPrompt.id)) {
            setSelectionIntent(null);
            return;
          }
          break;
      }
      setSelectionIntent(null);
    }

    // Default behavior: only reset if current selection is not in filtered list
    const isCurrentSelectionValid = selectedPrompt && 
      filteredPrompts.some(p => p.id === selectedPrompt.id);
    
    if (!isCurrentSelectionValid) {
      setSelectedPrompt(filteredPrompts[0] || null);
    }
  }, [filteredPrompts, selectedPrompt, selectionIntent, searchQuery, setSelectedPrompt]);

  const setSelectionIntentForNewPrompt = useCallback((promptId: string) => {
    setSelectionIntent({ type: 'select-new', targetId: promptId });
  }, []);

  const setSelectionIntentForEditedPrompt = useCallback((promptId: string) => {
    setSelectionIntent({ type: 'select-edited', targetId: promptId });
  }, []);

  const setSelectionIntentForPreserve = useCallback(() => {
    setSelectionIntent({ type: 'preserve' });
  }, []);

  return {
    selectionIntent,
    setSelectionIntentForNewPrompt,
    setSelectionIntentForEditedPrompt,
    setSelectionIntentForPreserve,
  };
};
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import type { Prompt, CreatePromptRequest, UpdatePromptRequest, SearchQuery } from '../types'
import { logger } from '../utils'

interface PromptState {
  // State
  prompts: Prompt[]
  selectedPrompt: Prompt | null
  searchQuery: string
  isLoading: boolean
  error: string | null
  
  // Actions
  setPrompts: (prompts: Prompt[]) => void
  setSelectedPrompt: (prompt: Prompt | null) => void
  setSearchQuery: (query: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Async Actions (will be implemented with services)
  createPrompt: (request: CreatePromptRequest) => Promise<void>
  updatePrompt: (request: UpdatePromptRequest) => Promise<void>
  deletePrompt: (id: string) => Promise<void>
  searchPrompts: (query: SearchQuery) => Promise<void>
  loadPrompts: () => Promise<void>
}

export const usePromptStore = create<PromptState>()(
  devtools(
    (set, get) => ({
      // Initial state
      prompts: [],
      selectedPrompt: null,
      searchQuery: '',
      isLoading: false,
      error: null,

      // Synchronous actions
      setPrompts: (prompts) => set({ prompts }),
      setSelectedPrompt: (selectedPrompt) => set({ selectedPrompt }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Async actions (placeholder implementations for Phase 1.0)
      createPrompt: async (request) => {
        set({ isLoading: true, error: null })
        try {
          logger.debug('Creating prompt (Phase 1.0 placeholder):', request)
          // Phase 1.1: Will implement actual API call
          set({ isLoading: false })
        } catch (error) {
          logger.error('Failed to create prompt:', error)
          set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false })
        }
      },

      updatePrompt: async (request) => {
        set({ isLoading: true, error: null })
        try {
          logger.debug('Updating prompt (Phase 1.0 placeholder):', request)
          // Phase 1.1: Will implement actual API call
          set({ isLoading: false })
        } catch (error) {
          logger.error('Failed to update prompt:', error)
          set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false })
        }
      },

      deletePrompt: async (id) => {
        set({ isLoading: true, error: null })
        try {
          logger.debug('Deleting prompt (Phase 1.0 placeholder):', id)
          // Phase 1.1: Will implement actual API call
          const { prompts } = get()
          set({ 
            prompts: prompts.filter(p => p.id !== id),
            selectedPrompt: get().selectedPrompt?.id === id ? null : get().selectedPrompt,
            isLoading: false 
          })
        } catch (error) {
          logger.error('Failed to delete prompt:', error)
          set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false })
        }
      },

      searchPrompts: async (query) => {
        set({ isLoading: true, error: null })
        try {
          logger.debug('Searching prompts (Phase 1.0 placeholder):', query)
          // Phase 1.1: Will implement actual API call
          set({ isLoading: false })
        } catch (error) {
          logger.error('Failed to search prompts:', error)
          set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false })
        }
      },

      loadPrompts: async () => {
        set({ isLoading: true, error: null })
        try {
          logger.debug('Loading prompts (Phase 1.0 placeholder)')
          // Phase 1.1: Will implement actual API call
          set({ isLoading: false })
        } catch (error) {
          logger.error('Failed to load prompts:', error)
          set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false })
        }
      },
    }),
    {
      name: 'prompt-store',
    }
  )
)
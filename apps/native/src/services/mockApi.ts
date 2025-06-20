/**
 * Mock API for E2E testing
 * Provides in-memory data for testing UI components
 */

import type { 
  Prompt, 
  CreatePromptRequest, 
  UpdatePromptRequest, 
  SearchQuery,
  PinnedPrompt,
  PinPromptRequest,
  UnpinPromptRequest,
  CopyPinnedPromptRequest
} from '../types'

// Mock data for testing
const mockPrompts: Prompt[] = [
  {
    id: '1',
    title: 'Test Prompt 1',
    content: 'This is a test prompt for E2E testing.',
    tags: ['test', 'e2e'],
    quickAccessKey: 'test1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Test Prompt 2',
    content: 'Another test prompt for keyboard navigation testing.',
    tags: ['test', 'navigation'],
    quickAccessKey: 'test2',
    created_at: '2024-01-01T01:00:00Z',
    updated_at: '2024-01-01T01:00:00Z',
  },
  {
    id: '3',
    title: 'Sample Code Review',
    content: 'Please review this code for best practices and potential improvements.',
    tags: ['code', 'review'],
    quickAccessKey: 'review',
    created_at: '2024-01-01T02:00:00Z',
    updated_at: '2024-01-01T02:00:00Z',
  },
]

let mockPinnedPrompts: PinnedPrompt[] = [
  {
    id: mockPrompts[0]!.id,
    title: mockPrompts[0]!.title,
    content: mockPrompts[0]!.content,
    tags: mockPrompts[0]!.tags,
    quickAccessKey: mockPrompts[0]!.quickAccessKey,
    created_at: mockPrompts[0]!.created_at,
    updated_at: mockPrompts[0]!.updated_at,
    position: 1,
    pinned_at: '2024-01-01T00:00:00Z',
  }
]

export const mockPromptsApi = {
  async getAll(): Promise<Prompt[]> {
    await new Promise(resolve => setTimeout(resolve, 100)) // Simulate API delay
    return [...mockPrompts]
  },

  async getById(id: string): Promise<Prompt | null> {
    await new Promise(resolve => setTimeout(resolve, 50))
    return mockPrompts.find(p => p.id === id) || null
  },

  async create(request: CreatePromptRequest): Promise<Prompt> {
    await new Promise(resolve => setTimeout(resolve, 200))
    const newPrompt: Prompt = {
      id: Date.now().toString(),
      ...request,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    mockPrompts.push(newPrompt)
    return newPrompt
  },

  async update(request: UpdatePromptRequest): Promise<Prompt | null> {
    await new Promise(resolve => setTimeout(resolve, 200))
    const index = mockPrompts.findIndex(p => p.id === request.id)
    if (index === -1) return null
    
    const updatedPrompt: Prompt = {
      ...mockPrompts[index]!,
      title: request.title!,
      content: request.content!,
      tags: request.tags,
      quickAccessKey: request.quickAccessKey,
      updated_at: new Date().toISOString(),
    }
    mockPrompts[index] = updatedPrompt
    return updatedPrompt
  },

  async delete(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100))
    const index = mockPrompts.findIndex(p => p.id === id)
    if (index === -1) return false
    
    mockPrompts.splice(index, 1)
    // Also remove from pinned if it was pinned
    mockPinnedPrompts = mockPinnedPrompts.filter(p => p.id !== id)
    return true
  },

  async search(query: SearchQuery): Promise<Prompt[]> {
    await new Promise(resolve => setTimeout(resolve, 100))
    if (!query.q) return [...mockPrompts]
    
    const searchTerm = query.q.toLowerCase()
    return mockPrompts.filter(prompt => 
      prompt.title.toLowerCase().includes(searchTerm) ||
      prompt.content.toLowerCase().includes(searchTerm) ||
      prompt.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      (prompt.quickAccessKey && searchTerm.startsWith('/') && 
        prompt.quickAccessKey.toLowerCase().includes(searchTerm.slice(1)))
    )
  },
}

export const mockPinnedPromptsApi = {
  async pin(request: PinPromptRequest): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 100))
    const prompt = mockPrompts.find(p => p.id === request.prompt_id)
    if (!prompt) throw new Error('Prompt not found')
    
    // Remove from current position if already pinned
    mockPinnedPrompts = mockPinnedPrompts.filter(p => p.id !== request.prompt_id)
    
    // Add to new position
    const pinnedPrompt: PinnedPrompt = {
      ...prompt,
      position: request.position,
      pinned_at: new Date().toISOString(),
    }
    mockPinnedPrompts.push(pinnedPrompt)
    
    return 'Prompt pinned successfully'
  },

  async unpin(request: UnpinPromptRequest): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 100))
    mockPinnedPrompts = mockPinnedPrompts.filter(p => p.position !== request.position)
    return 'Prompt unpinned successfully'
  },

  async getAll(): Promise<PinnedPrompt[]> {
    await new Promise(resolve => setTimeout(resolve, 100))
    return [...mockPinnedPrompts].sort((a, b) => a.position - b.position)
  },

  async copyToClipboard(request: CopyPinnedPromptRequest): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 50))
    const pinnedPrompt = mockPinnedPrompts.find(p => p.position === request.position)
    if (!pinnedPrompt) throw new Error('Pinned prompt not found')
    
    // Mock clipboard operation
    return `Copied "${pinnedPrompt.title}" to clipboard`
  },
}

export const mockHealthApi = {
  async getAppInfo(): Promise<{ name: string; version: string; description: string }> {
    await new Promise(resolve => setTimeout(resolve, 50))
    return {
      name: 'PromPalette (E2E Test Mode)',
      version: '0.1.0-e2e',
      description: 'Mock API for E2E testing'
    }
  },

  async initDatabase(): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 100))
    return 'Mock database initialized'
  },
}
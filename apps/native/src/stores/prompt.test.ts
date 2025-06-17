import { act, renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import * as services from '../services'
import * as utils from '../utils'

import { usePromptStore } from './prompt'

// Services のモック
vi.mock('../services', () => ({
  promptsApi: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    search: vi.fn()
  }
}))

// Utils のモック
vi.mock('../utils', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}))

const mockPromptsApi = services.promptsApi as any
const mockLogger = utils.logger as any

// テスト用のサンプルデータ
const samplePrompts = [
  {
    id: '1',
    title: 'Test Prompt 1',
    content: 'This is test content 1',
    tags: ['test', 'sample'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    title: 'Test Prompt 2',
    content: 'This is test content 2',
    tags: ['test', 'example'],
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  }
]

describe('usePromptStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // ストアの状態をリセット
    usePromptStore.setState({
      prompts: [],
      selectedPrompt: null,
      searchQuery: '',
      isLoading: false,
      error: null
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => usePromptStore())

      expect(result.current.prompts).toEqual([])
      expect(result.current.selectedPrompt).toBeNull()
      expect(result.current.searchQuery).toBe('')
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('Synchronous Actions', () => {
    it('should update prompts correctly', () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setPrompts(samplePrompts)
      })

      expect(result.current.prompts).toEqual(samplePrompts)
    })

    it('should update selected prompt correctly', () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setSelectedPrompt(samplePrompts[0]!)
      })

      expect(result.current.selectedPrompt).toEqual(samplePrompts[0]!)
    })

    it('should update search query correctly', () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setSearchQuery('test query')
      })

      expect(result.current.searchQuery).toBe('test query')
    })

    it('should update loading state correctly', () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setLoading(true)
      })

      expect(result.current.isLoading).toBe(true)
    })

    it('should update error state correctly', () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setError('Test error')
      })

      expect(result.current.error).toBe('Test error')
    })
  })

  describe('loadPrompts', () => {
    it('should load prompts successfully', async () => {
      mockPromptsApi.getAll.mockResolvedValue(samplePrompts)
      const { result } = renderHook(() => usePromptStore())

      await act(async () => {
        await result.current.loadPrompts()
      })

      expect(mockPromptsApi.getAll).toHaveBeenCalledTimes(1)
      expect(result.current.prompts).toEqual(samplePrompts)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(mockLogger.debug).toHaveBeenCalledWith('Loading prompts from database')
      expect(mockLogger.info).toHaveBeenCalledWith('Loaded 2 prompts from database')
    })

    it('should handle load prompts error', async () => {
      const errorMessage = 'Failed to load data'
      mockPromptsApi.getAll.mockRejectedValue(new Error(errorMessage))
      const { result } = renderHook(() => usePromptStore())

      await act(async () => {
        await result.current.loadPrompts()
      })

      expect(result.current.prompts).toEqual([])
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe(errorMessage)
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to load prompts:', expect.any(Error))
    })

    it('should set loading state during operation', async () => {
      let resolvePromise: any
      const promise = new Promise(resolve => { resolvePromise = resolve })
      mockPromptsApi.getAll.mockReturnValue(promise)

      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.loadPrompts()
      })

      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBeNull()

      await act(async () => {
        resolvePromise(samplePrompts)
        await promise
      })

      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('createPrompt', () => {
    it('should create prompt successfully', async () => {
      const newPromptRequest = { title: 'New Prompt', content: 'New Content', tags: ['new'] }
      const createdPrompt = { id: '3', ...newPromptRequest, created_at: '2024-01-03T00:00:00Z', updated_at: '2024-01-03T00:00:00Z' }
      
      mockPromptsApi.create.mockResolvedValue(createdPrompt)
      const { result } = renderHook(() => usePromptStore())

      // 既存のプロンプトを設定
      act(() => {
        result.current.setPrompts(samplePrompts)
      })

      await act(async () => {
        await result.current.createPrompt(newPromptRequest)
      })

      expect(mockPromptsApi.create).toHaveBeenCalledWith(newPromptRequest)
      expect(result.current.prompts).toHaveLength(3)
      expect(result.current.prompts[0]!).toEqual(createdPrompt) // 新しいプロンプトが先頭に追加
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(mockLogger.debug).toHaveBeenCalledWith('Creating prompt:', newPromptRequest)
      expect(mockLogger.info).toHaveBeenCalledWith('Prompt created successfully:', '3')
    })

    it('should handle create prompt error', async () => {
      const newPromptRequest = { title: 'New Prompt', content: 'New Content', tags: ['new'] }
      const errorMessage = 'Validation failed'
      
      mockPromptsApi.create.mockRejectedValue(new Error(errorMessage))
      const { result } = renderHook(() => usePromptStore())

      await act(async () => {
        await result.current.createPrompt(newPromptRequest)
      })

      expect(result.current.prompts).toEqual([])
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe(errorMessage)
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to create prompt:', expect.any(Error))
    })

    it('should handle non-Error exception', async () => {
      const newPromptRequest = { title: 'New Prompt', content: 'New Content', tags: ['new'] }
      
      mockPromptsApi.create.mockRejectedValue('String error')
      const { result } = renderHook(() => usePromptStore())

      await act(async () => {
        await result.current.createPrompt(newPromptRequest)
      })

      expect(result.current.error).toBe('Unknown error')
    })
  })

  describe('updatePrompt', () => {
    it('should update prompt successfully', async () => {
      const updateRequest = { id: '1', title: 'Updated Title', content: 'Updated Content', tags: ['updated'] }
      const updatedPrompt = { ...updateRequest, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-03T00:00:00Z' }
      
      mockPromptsApi.update.mockResolvedValue(updatedPrompt)
      const { result } = renderHook(() => usePromptStore())

      // 既存のプロンプトを設定
      act(() => {
        result.current.setPrompts(samplePrompts)
        result.current.setSelectedPrompt(samplePrompts[0]!)
      })

      await act(async () => {
        await result.current.updatePrompt(updateRequest)
      })

      expect(mockPromptsApi.update).toHaveBeenCalledWith(updateRequest)
      expect(result.current.prompts[0]!).toEqual(updatedPrompt)
      expect(result.current.selectedPrompt).toEqual(updatedPrompt) // 選択中のプロンプトも更新
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(mockLogger.debug).toHaveBeenCalledWith('Updating prompt:', updateRequest)
      expect(mockLogger.info).toHaveBeenCalledWith('Prompt updated successfully:', '1')
    })

    it('should handle update when prompt not found', async () => {
      const updateRequest = { id: '999', title: 'Updated Title', content: 'Updated Content', tags: ['updated'] }
      
      mockPromptsApi.update.mockResolvedValue(null)
      const { result } = renderHook(() => usePromptStore())

      await act(async () => {
        await result.current.updatePrompt(updateRequest)
      })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe('Prompt not found')
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to update prompt:', expect.any(Error))
    })

    it('should update selectedPrompt only if it matches updated prompt', async () => {
      const updateRequest = { id: '2', title: 'Updated Title', content: 'Updated Content', tags: ['updated'] }
      const updatedPrompt = { ...updateRequest, created_at: '2024-01-02T00:00:00Z', updated_at: '2024-01-03T00:00:00Z' }
      
      mockPromptsApi.update.mockResolvedValue(updatedPrompt)
      const { result } = renderHook(() => usePromptStore())

      // 別のプロンプトを選択中に設定
      act(() => {
        result.current.setPrompts(samplePrompts)
        result.current.setSelectedPrompt(samplePrompts[0]!) // ID '1' を選択
      })

      await act(async () => {
        await result.current.updatePrompt(updateRequest) // ID '2' を更新
      })

      expect(result.current.selectedPrompt).toEqual(samplePrompts[0]!) // 選択中プロンプトは変更されない
      expect(result.current.prompts[1]!).toEqual(updatedPrompt) // 配列内のプロンプトは更新される
    })
  })

  describe('deletePrompt', () => {
    it('should delete prompt successfully', async () => {
      mockPromptsApi.delete.mockResolvedValue(true)
      const { result } = renderHook(() => usePromptStore())

      // 既存のプロンプトを設定
      act(() => {
        result.current.setPrompts(samplePrompts)
        result.current.setSelectedPrompt(samplePrompts[0]!)
      })

      await act(async () => {
        await result.current.deletePrompt('1')
      })

      expect(mockPromptsApi.delete).toHaveBeenCalledWith('1')
      expect(result.current.prompts).toHaveLength(1)
      expect(result.current.prompts[0]?.id).toBe('2')
      expect(result.current.selectedPrompt).toBeNull() // 削除されたプロンプトが選択中だった場合はクリア
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(mockLogger.debug).toHaveBeenCalledWith('Deleting prompt:', '1')
      expect(mockLogger.info).toHaveBeenCalledWith('Prompt deleted successfully:', '1')
    })

    it('should handle delete when prompt not found', async () => {
      mockPromptsApi.delete.mockResolvedValue(false)
      const { result } = renderHook(() => usePromptStore())

      await act(async () => {
        await result.current.deletePrompt('999')
      })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe('Prompt not found')
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to delete prompt:', expect.any(Error))
    })

    it('should not clear selectedPrompt if different prompt is deleted', async () => {
      mockPromptsApi.delete.mockResolvedValue(true)
      const { result } = renderHook(() => usePromptStore())

      // 既存のプロンプトを設定
      act(() => {
        result.current.setPrompts(samplePrompts)
        result.current.setSelectedPrompt(samplePrompts[0]!) // ID '1' を選択
      })

      await act(async () => {
        await result.current.deletePrompt('2') // 別のプロンプトを削除
      })

      expect(result.current.selectedPrompt).toEqual(samplePrompts[0]!) // 選択中プロンプトは保持
      expect(result.current.prompts).toHaveLength(1)
      expect(result.current.prompts[0]?.id).toBe('1')
    })
  })

  describe('searchPrompts', () => {
    it('should search prompts successfully', async () => {
      const searchQuery = { q: 'test' }
      const searchResults = [samplePrompts[0]!]
      
      mockPromptsApi.search.mockResolvedValue(searchResults)
      const { result } = renderHook(() => usePromptStore())

      await act(async () => {
        await result.current.searchPrompts(searchQuery)
      })

      expect(mockPromptsApi.search).toHaveBeenCalledWith(searchQuery)
      expect(result.current.prompts).toEqual(searchResults)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(mockLogger.debug).toHaveBeenCalledWith('Searching prompts:', searchQuery)
      expect(mockLogger.info).toHaveBeenCalledWith('Found 1 prompts matching query')
    })

    it('should handle search error', async () => {
      const searchQuery = { q: 'test' }
      const errorMessage = 'Search failed'
      
      mockPromptsApi.search.mockRejectedValue(new Error(errorMessage))
      const { result } = renderHook(() => usePromptStore())

      await act(async () => {
        await result.current.searchPrompts(searchQuery)
      })

      expect(result.current.prompts).toEqual([])
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe(errorMessage)
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to search prompts:', expect.any(Error))
    })

    it('should handle empty search results', async () => {
      const searchQuery = { q: 'nonexistent' }
      
      mockPromptsApi.search.mockResolvedValue([])
      const { result } = renderHook(() => usePromptStore())

      await act(async () => {
        await result.current.searchPrompts(searchQuery)
      })

      expect(result.current.prompts).toEqual([])
      expect(mockLogger.info).toHaveBeenCalledWith('Found 0 prompts matching query')
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors consistently', async () => {
      const operations = [
        () => usePromptStore.getState().loadPrompts(),
        () => usePromptStore.getState().createPrompt({ title: 'Test', content: 'Test', tags: [] }),
        () => usePromptStore.getState().updatePrompt({ id: '1', title: 'Test', content: 'Test', tags: [] }),
        () => usePromptStore.getState().deletePrompt('1'),
        () => usePromptStore.getState().searchPrompts({ q: 'test' })
      ]

      const apiMethods = [
        mockPromptsApi.getAll,
        mockPromptsApi.create,
        mockPromptsApi.update,
        mockPromptsApi.delete,
        mockPromptsApi.search
      ]

      for (let i = 0; i < operations.length; i++) {
        // 各APIメソッドにエラーを設定
        apiMethods[i]!.mockRejectedValue(new Error('API Error'))
        
        await act(async () => {
          await operations[i]!()
        })

        const state = usePromptStore.getState()
        expect(state.isLoading).toBe(false)
        expect(state.error).toBe('API Error')

        // リセット
        usePromptStore.setState({ error: null })
        apiMethods[i]!.mockClear()
      }
    })
  })

  describe('State Mutations', () => {
    it('should not mutate state objects directly', () => {
      const { result } = renderHook(() => usePromptStore())
      const initialPrompts = result.current.prompts

      act(() => {
        result.current.setPrompts(samplePrompts)
      })

      // 初期の配列参照が変わることを確認
      expect(result.current.prompts).not.toBe(initialPrompts)
      expect(result.current.prompts).toEqual(samplePrompts)
    })

    it('should handle concurrent operations correctly', async () => {
      mockPromptsApi.getAll.mockResolvedValue(samplePrompts)
      mockPromptsApi.create.mockResolvedValue({ 
        id: '3', 
        title: 'New', 
        content: 'Content', 
        tags: [],
        created_at: '2024-01-03T00:00:00Z',
        updated_at: '2024-01-03T00:00:00Z'
      })

      const { result } = renderHook(() => usePromptStore())

      // 同時に複数の操作を実行
      await act(async () => {
        await Promise.all([
          result.current.loadPrompts(),
          result.current.createPrompt({ title: 'New', content: 'Content', tags: [] })
        ])
      })

      // 最終的な状態が正しいことを確認
      expect(result.current.prompts.length).toBeGreaterThan(0)
      expect(result.current.isLoading).toBe(false)
    })
  })
})
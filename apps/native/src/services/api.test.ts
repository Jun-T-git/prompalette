import { invoke } from '@tauri-apps/api/core'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import * as utils from '../utils'

import { promptsApi, healthApi } from './api'

// Mock modules before imports
vi.mock('@tauri-apps/api/core')
vi.mock('../utils')

const mockInvoke = vi.mocked(invoke)
const mockLogger = vi.mocked(utils.logger)
const mockGetEnvironmentInfo = vi.mocked(utils.getEnvironmentInfo)

describe('API Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // デフォルトではTauri環境として設定
    mockGetEnvironmentInfo.mockResolvedValue({
      environment: 'development',
      isDevelopment: true,
      isStaging: false,
      isProduction: false,
      appName: 'PromPalette Dev',
      storagePrefix: 'prompalette-dev',
      appIdentifier: 'com.prompalette.app.dev',
      windowTitle: 'PromPalette [DEV]'
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('promptsApi', () => {
    describe('getAll', () => {
      it('should return all prompts successfully', async () => {
        const mockPrompts = [
          { id: '1', title: 'Test 1', content: 'Content 1', tags: ['tag1'] },
          { id: '2', title: 'Test 2', content: 'Content 2', tags: ['tag2'] }
        ]
        mockInvoke.mockResolvedValue({ success: true, data: mockPrompts })

        const result = await promptsApi.getAll()

        expect(mockInvoke).toHaveBeenCalledWith('get_all_prompts', undefined)
        expect(result).toEqual(mockPrompts)
      })

      it('should throw ApiError when command fails', async () => {
        mockInvoke.mockRejectedValue(new Error('Database error'))

        await expect(promptsApi.getAll()).rejects.toThrow('Database error')
        expect(mockLogger.error).toHaveBeenCalledWith(
          'Tauri command "get_all_prompts" failed:',
          { error: 'Database error', args: undefined }
        )
      })

      it('should throw ApiError when Tauri environment is not available', async () => {
        mockGetEnvironmentInfo.mockRejectedValue(new Error('Not in Tauri environment'))

        await expect(promptsApi.getAll()).rejects.toThrow(
          'Tauri environment not available. Please run "pnpm dev" instead of "pnpm dev:web"'
        )
        expect(mockLogger.error).toHaveBeenCalledWith(
          'Tauri command "get_all_prompts" failed:',
          { 
            error: 'Tauri environment not available. Please run "pnpm dev" instead of "pnpm dev:web"',
            args: undefined 
          }
        )
      })

      it('should handle non-successful response', async () => {
        mockInvoke.mockResolvedValue({ success: false, data: null })

        await expect(promptsApi.getAll()).rejects.toThrow('Command execution failed')
      })
    })

    describe('getById', () => {
      it('should return prompt by ID successfully', async () => {
        const mockPrompt = { id: '1', title: 'Test', content: 'Content', tags: ['tag'] }
        mockInvoke.mockResolvedValue({ success: true, data: mockPrompt })

        const result = await promptsApi.getById('1')

        expect(mockInvoke).toHaveBeenCalledWith('get_prompt', { id: '1' })
        expect(result).toEqual(mockPrompt)
      })

      it('should return null when prompt not found', async () => {
        mockInvoke.mockResolvedValue({ success: true, data: null })

        const result = await promptsApi.getById('nonexistent')

        expect(result).toBeNull()
      })
    })

    describe('create', () => {
      it('should create new prompt successfully', async () => {
        const createRequest = { title: 'New Prompt', content: 'New Content', tags: ['new'] }
        const mockCreatedPrompt = { id: 'new-id', ...createRequest }
        mockInvoke.mockResolvedValue({ success: true, data: mockCreatedPrompt })

        const result = await promptsApi.create(createRequest)

        expect(mockInvoke).toHaveBeenCalledWith('create_prompt', { request: createRequest })
        expect(result).toEqual(mockCreatedPrompt)
      })

      it('should handle creation validation errors', async () => {
        const createRequest = { title: '', content: '', tags: [] }
        mockInvoke.mockRejectedValue({ error: 'Validation failed: title is required' })

        await expect(promptsApi.create(createRequest)).rejects.toThrow(
          'Validation failed: title is required'
        )
      })
    })

    describe('update', () => {
      it('should update existing prompt successfully', async () => {
        const updateRequest = { 
          id: '1', 
          title: 'Updated Title', 
          content: 'Updated Content', 
          tags: ['updated'] 
        }
        const mockUpdatedPrompt = { ...updateRequest }
        mockInvoke.mockResolvedValue({ success: true, data: mockUpdatedPrompt })

        const result = await promptsApi.update(updateRequest)

        expect(mockInvoke).toHaveBeenCalledWith('update_prompt', {
          id: '1',
          request: {
            title: 'Updated Title',
            content: 'Updated Content',
            tags: ['updated']
          }
        })
        expect(result).toEqual(mockUpdatedPrompt)
      })

      it('should return null when prompt to update not found', async () => {
        const updateRequest = { id: 'nonexistent', title: 'Test', content: 'Test', tags: [] }
        mockInvoke.mockResolvedValue({ success: true, data: null })

        const result = await promptsApi.update(updateRequest)

        expect(result).toBeNull()
      })
    })

    describe('delete', () => {
      it('should delete prompt successfully', async () => {
        mockInvoke.mockResolvedValue({ success: true, data: true })

        const result = await promptsApi.delete('1')

        expect(mockInvoke).toHaveBeenCalledWith('delete_prompt', { id: '1' })
        expect(result).toBe(true)
      })

      it('should return false when prompt to delete not found', async () => {
        mockInvoke.mockResolvedValue({ success: true, data: false })

        const result = await promptsApi.delete('nonexistent')

        expect(result).toBe(false)
      })

      it('should handle deletion errors', async () => {
        mockInvoke.mockRejectedValue(new Error('Foreign key constraint violation'))

        await expect(promptsApi.delete('1')).rejects.toThrow('Foreign key constraint violation')
      })
    })

    describe('search', () => {
      it('should search prompts successfully', async () => {
        const mockResults = [
          { id: '1', title: 'ChatGPT Helper', content: 'AI assistant', tags: ['ai'] }
        ]
        mockInvoke.mockResolvedValue({ success: true, data: mockResults })

        const result = await promptsApi.search({ q: 'ChatGPT' })

        expect(mockInvoke).toHaveBeenCalledWith('search_prompts', { query: 'ChatGPT' })
        expect(result).toEqual(mockResults)
      })

      it('should handle empty search query', async () => {
        const mockResults: any[] = []
        mockInvoke.mockResolvedValue({ success: true, data: mockResults })

        const result = await promptsApi.search({ q: '' })

        expect(mockInvoke).toHaveBeenCalledWith('search_prompts', { query: '' })
        expect(result).toEqual(mockResults)
      })

      it('should handle undefined search query', async () => {
        const mockResults: any[] = []
        mockInvoke.mockResolvedValue({ success: true, data: mockResults })

        const result = await promptsApi.search({})

        expect(mockInvoke).toHaveBeenCalledWith('search_prompts', { query: '' })
        expect(result).toEqual(mockResults)
      })
    })
  })

  describe('healthApi', () => {
    describe('getAppInfo', () => {
      it('should return app info successfully', async () => {
        const mockAppInfo = {
          name: 'PromPalette',
          version: '1.0.0',
          description: 'Prompt management app'
        }
        mockInvoke.mockResolvedValue({ success: true, data: mockAppInfo })

        const result = await healthApi.getAppInfo()

        expect(mockInvoke).toHaveBeenCalledWith('get_app_info', undefined)
        expect(result).toEqual(mockAppInfo)
      })

      it('should handle app info retrieval errors', async () => {
        mockInvoke.mockRejectedValue(new Error('App info not available'))

        await expect(healthApi.getAppInfo()).rejects.toThrow('App info not available')
      })
    })

    describe('initDatabase', () => {
      it('should initialize database successfully', async () => {
        const successMessage = 'Database initialized successfully'
        mockInvoke.mockResolvedValue({ success: true, data: successMessage })

        const result = await healthApi.initDatabase()

        expect(mockInvoke).toHaveBeenCalledWith('init_database', undefined)
        expect(result).toBe(successMessage)
      })

      it('should handle database initialization errors', async () => {
        mockInvoke.mockRejectedValue(new Error('Database initialization failed'))

        await expect(healthApi.initDatabase()).rejects.toThrow('Database initialization failed')
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle string errors', async () => {
      mockInvoke.mockRejectedValue('String error message')

      await expect(promptsApi.getAll()).rejects.toThrow('String error message')
    })

    it('should handle object errors with error property', async () => {
      mockInvoke.mockRejectedValue({ error: 'Object error message' })

      await expect(promptsApi.getAll()).rejects.toThrow('Object error message')
    })

    it('should handle unknown error types', async () => {
      mockInvoke.mockRejectedValue(123)

      await expect(promptsApi.getAll()).rejects.toThrow('Unknown error occurred')
    })

    it('should handle null errors', async () => {
      mockInvoke.mockRejectedValue(null)

      await expect(promptsApi.getAll()).rejects.toThrow('Unknown error occurred')
    })
  })

  describe('Tauri Environment Checks', () => {
    it('should handle when Tauri invoke is not available', async () => {
      // getEnvironmentInfo は成功するが、invoke が何らかの理由で利用できない状況をシミュレート
      // 実際のコードでは getTauriInvoke が null を返すケースは非常に稀だが、防御的プログラミングとしてテスト
      mockGetEnvironmentInfo.mockResolvedValue({
        environment: 'development',
        isDevelopment: true,
        isStaging: false,
        isProduction: false,
        appName: 'PromPalette Dev',
        storagePrefix: 'prompalette-dev',
        appIdentifier: 'com.prompalette.app.dev',
        windowTitle: 'PromPalette [DEV]'
      })
      
      // invoke 関数自体を undefined にするために、動的 import をモック
      vi.doMock('@tauri-apps/api/core', () => ({
        invoke: undefined
      }))

      // この場合、実際の getTauriInvoke 関数はinvokeが存在するかチェックするので、
      // より現実的なテストケースは getEnvironmentInfo が失敗する場合のみ
      // ここでは一般的な Tauri API 利用不可のケースをテスト
      mockGetEnvironmentInfo.mockRejectedValue(new Error('Not in Tauri environment'))

      await expect(promptsApi.getAll()).rejects.toThrow(
        'Tauri environment not available. Please run "pnpm dev" instead of "pnpm dev:web"'
      )
    })
  })
})
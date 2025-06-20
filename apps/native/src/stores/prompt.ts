import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { promptsApi } from '../services'
import type { Prompt, CreatePromptRequest, UpdatePromptRequest, SearchQuery } from '../types'
import { logger } from '../utils'

// 操作ロック管理用のマップ（操作タイプごとにロック）
const operationLocks = new Map<string, boolean>()

/**
 * プロンプト管理のグローバル状態インターフェース
 * Zustandストアで管理されるアプリケーション状態とアクションを定義
 */
interface PromptState {
  // === 状態プロパティ ===
  
  /** 現在読み込まれているプロンプトの一覧 */
  prompts: Prompt[]
  
  /** 現在選択されているプロンプト（詳細表示用） */
  selectedPrompt: Prompt | null
  
  /** 現在の検索クエリ文字列 */
  searchQuery: string
  
  /** API処理中かどうかのフラグ */
  isLoading: boolean
  
  /** エラーメッセージ（エラーなしの場合はnull） */
  error: string | null
  
  // === 同期アクション ===
  
  /** プロンプト一覧を更新 */
  setPrompts: (prompts: Prompt[]) => void
  
  /** 選択中プロンプトを更新 */
  setSelectedPrompt: (prompt: Prompt | null) => void
  
  /** 検索クエリを更新 */
  setSearchQuery: (query: string) => void
  
  /** ローディング状態を更新 */
  setLoading: (loading: boolean) => void
  
  /** エラー状態を更新 */
  setError: (error: string | null) => void
  
  // === 非同期アクション（Phase 1.1でAPI統合予定） ===
  
  /** 新しいプロンプトを作成 */
  createPrompt: (request: CreatePromptRequest) => Promise<Prompt>
  
  /** 既存プロンプトを更新 */
  updatePrompt: (request: UpdatePromptRequest) => Promise<Prompt>
  
  /** プロンプトを削除 */
  deletePrompt: (id: string) => Promise<void>
  
  /** 条件を指定してプロンプトを検索 */
  searchPrompts: (query: SearchQuery) => Promise<void>
  
  /** 全プロンプトを読み込み */
  loadPrompts: (signal?: AbortSignal) => Promise<void>
}

/**
 * プロンプト管理用のZustandストア
 * アプリケーション全体のプロンプト状態と操作を一元管理
 * Redux DevTools連携でデバッグしやすい設計
 * 
 * @example
 * ```typescript
 * import { usePromptStore } from './stores'
 * 
 * function MyComponent() {
 *   const { prompts, loadPrompts, createPrompt } = usePromptStore()
 *   
 *   useEffect(() => {
 *     loadPrompts()
 *   }, [])
 *   
 *   const handleCreate = async () => {
 *     await createPrompt({ title: 'タイトル', content: '内容' })
 *   }
 * }
 * ```
 */
export const usePromptStore = create<PromptState>()(
  devtools(
    (set, get) => ({
      // === 初期状態 ===
      prompts: [],
      selectedPrompt: null,
      searchQuery: '',
      isLoading: false,
      error: null,

      // === 同期アクション ===
      setPrompts: (prompts) => set({ prompts }),
      setSelectedPrompt: (selectedPrompt) => set({ selectedPrompt }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // === 非同期アクション（Phase 1.0はプレースホルダー実装） ===
      
      /**
       * 新しいプロンプトを作成
       */
      createPrompt: async (request) => {
        const lockKey = 'create'
        if (operationLocks.get(lockKey)) {
          logger.warn('Create operation already in progress')
          throw new Error('Create operation already in progress')
        }
        
        operationLocks.set(lockKey, true)
        set({ isLoading: true, error: null })
        try {
          logger.debug('Creating prompt:', request)
          const newPrompt = await promptsApi.create(request)
          const currentPrompts = get().prompts
          set({ 
            prompts: [newPrompt, ...currentPrompts],
            isLoading: false 
          })
          logger.info('Prompt created successfully:', newPrompt.id)
          return newPrompt
        } catch (error) {
          logger.error('Failed to create prompt:', error)
          set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false })
          throw error
        } finally {
          operationLocks.set(lockKey, false)
        }
      },

      /**
       * 既存プロンプトを更新
       */
      updatePrompt: async (request) => {
        const lockKey = `update_${request.id}`
        if (operationLocks.get(lockKey)) {
          logger.warn(`Update operation already in progress for prompt ${request.id}`)
          throw new Error(`Update operation already in progress for prompt ${request.id}`)
        }
        
        operationLocks.set(lockKey, true)
        set({ isLoading: true, error: null })
        try {
          logger.debug('Updating prompt:', request)
          const updatedPrompt = await promptsApi.update(request)
          if (updatedPrompt) {
            const { prompts } = get()
            set({ 
              prompts: prompts.map(p => p.id === request.id ? updatedPrompt : p),
              selectedPrompt: get().selectedPrompt?.id === request.id ? updatedPrompt : get().selectedPrompt,
              isLoading: false 
            })
            logger.info('Prompt updated successfully:', updatedPrompt.id)
            return updatedPrompt
          } else {
            throw new Error('Prompt not found')
          }
        } catch (error) {
          logger.error('Failed to update prompt:', error)
          set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false })
          throw error
        } finally {
          operationLocks.set(lockKey, false)
        }
      },

      /**
       * 指定したプロンプトを削除
       */
      deletePrompt: async (id) => {
        const lockKey = `delete_${id}`
        if (operationLocks.get(lockKey)) {
          logger.warn(`Delete operation already in progress for prompt ${id}`)
          return
        }
        
        operationLocks.set(lockKey, true)
        set({ isLoading: true, error: null })
        try {
          logger.debug('Deleting prompt:', id)
          const deleted = await promptsApi.delete(id)
          if (deleted) {
            const { prompts } = get()
            set({ 
              prompts: prompts.filter(p => p.id !== id),
              selectedPrompt: get().selectedPrompt?.id === id ? null : get().selectedPrompt,
              isLoading: false 
            })
            logger.info('Prompt deleted successfully:', id)
          } else {
            throw new Error('Prompt not found')
          }
        } catch (error) {
          logger.error('Failed to delete prompt:', error)
          set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false })
        } finally {
          operationLocks.set(lockKey, false)
        }
      },

      /**
       * 条件を指定してプロンプトを検索
       */
      searchPrompts: async (query) => {
        const lockKey = 'search'
        if (operationLocks.get(lockKey)) {
          logger.warn('Search operation already in progress')
          return
        }
        
        operationLocks.set(lockKey, true)
        set({ isLoading: true, error: null })
        try {
          logger.debug('Searching prompts:', query)
          const prompts = await promptsApi.search(query)
          set({ 
            prompts,
            isLoading: false 
          })
          logger.info(`Found ${prompts.length} prompts matching query`)
        } catch (error) {
          logger.error('Failed to search prompts:', error)
          set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false })
        } finally {
          operationLocks.set(lockKey, false)
        }
      },

      /**
       * 全プロンプトをサーバーから読み込み
       */
      loadPrompts: async (signal?: AbortSignal) => {
        const lockKey = 'load'
        if (operationLocks.get(lockKey)) {
          logger.warn('Load operation already in progress')
          return
        }
        
        operationLocks.set(lockKey, true)
        set({ isLoading: true, error: null })
        try {
          logger.debug('Loading prompts from database')
          const prompts = await promptsApi.getAll(signal)
          
          // Check for cancellation after API call
          if (signal?.aborted) {
            logger.debug('Load prompts operation was cancelled')
            return
          }
          
          set({ 
            prompts,
            isLoading: false 
          })
          
          logger.info(`Loaded ${prompts.length} prompts from database`)
        } catch (error) {
          if (signal?.aborted) {
            logger.debug('Load prompts operation was cancelled')
            return
          }
          logger.error('Failed to load prompts:', error)
          set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false })
        } finally {
          operationLocks.set(lockKey, false)
        }
      },
    }),
    {
      name: 'prompt-store', // Redux DevToolsでの表示名
    }
  )
)
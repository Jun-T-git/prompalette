import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import type { Prompt, CreatePromptRequest, UpdatePromptRequest, SearchQuery } from '../types'
import { logger } from '../utils'

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
  createPrompt: (request: CreatePromptRequest) => Promise<void>
  
  /** 既存プロンプトを更新 */
  updatePrompt: (request: UpdatePromptRequest) => Promise<void>
  
  /** プロンプトを削除 */
  deletePrompt: (id: string) => Promise<void>
  
  /** 条件を指定してプロンプトを検索 */
  searchPrompts: (query: SearchQuery) => Promise<void>
  
  /** 全プロンプトを読み込み */
  loadPrompts: () => Promise<void>
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
       * Phase 1.1でpromptsApi.create()を使用した実装に更新予定
       */
      createPrompt: async (request) => {
        set({ isLoading: true, error: null })
        try {
          logger.debug('Creating prompt (Phase 1.0 placeholder):', request)
          // Phase 1.1: promptsApi.create(request)で実装予定
          set({ isLoading: false })
        } catch (error) {
          logger.error('Failed to create prompt:', error)
          set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false })
        }
      },

      /**
       * 既存プロンプトを更新
       * Phase 1.1でpromptsApi.update()を使用した実装に更新予定
       */
      updatePrompt: async (request) => {
        set({ isLoading: true, error: null })
        try {
          logger.debug('Updating prompt (Phase 1.0 placeholder):', request)
          // Phase 1.1: promptsApi.update(request)で実装予定
          set({ isLoading: false })
        } catch (error) {
          logger.error('Failed to update prompt:', error)
          set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false })
        }
      },

      /**
       * 指定したプロンプトを削除
       * Phase 1.0ではUI上の削除のみ実装、Phase 1.1でAPI呼び出し追加予定
       */
      deletePrompt: async (id) => {
        set({ isLoading: true, error: null })
        try {
          logger.debug('Deleting prompt (Phase 1.0 placeholder):', id)
          // Phase 1.1: await promptsApi.delete(id)で実装予定
          
          // 現在はUI上の削除のみ実施
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

      /**
       * 条件を指定してプロンプトを検索
       * Phase 1.1でpromptsApi.search()を使用した実装に更新予定
       */
      searchPrompts: async (query) => {
        set({ isLoading: true, error: null })
        try {
          logger.debug('Searching prompts (Phase 1.0 placeholder):', query)
          // Phase 1.1: const result = await promptsApi.search(query)で実装予定
          set({ isLoading: false })
        } catch (error) {
          logger.error('Failed to search prompts:', error)
          set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false })
        }
      },

      /**
       * 全プロンプトをサーバーから読み込み
       * Phase 1.1でpromptsApi.getAll()を使用した実装に更新予定
       */
      loadPrompts: async () => {
        set({ isLoading: true, error: null })
        try {
          logger.debug('Loading prompts (Phase 1.0 placeholder)')
          // Phase 1.1: const prompts = await promptsApi.getAll()で実装予定
          set({ isLoading: false })
        } catch (error) {
          logger.error('Failed to load prompts:', error)
          set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false })
        }
      },
    }),
    {
      name: 'prompt-store', // Redux DevToolsでの表示名
    }
  )
)
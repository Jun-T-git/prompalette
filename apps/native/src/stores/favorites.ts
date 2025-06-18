import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { pinnedPromptsApi } from '../services'
import type { 
  PinnedPrompt, 
  HotkeyConfig, 
  PinPromptRequest, 
  UnpinPromptRequest,
  CopyPinnedPromptRequest 
} from '../types'
import { logger } from '../utils'

// 操作ロック管理用のMap（操作別に管理）
const operationLocks = new Map<string, boolean>()

/**
 * お気に入り/ピン留めプロンプト管理のグローバル状態インターフェース
 * Zustandストアで管理されるピン留めプロンプト状態とアクションを定義
 */
interface FavoritesState {
  // === 状態プロパティ ===
  
  /** ピン留めされたプロンプトの配列（最大10個、位置順） */
  pinnedPrompts: (PinnedPrompt | null)[]
  
  /** 現在選択されているピン留めプロンプト */
  selectedPinnedPrompt: PinnedPrompt | null
  
  /** ホットキー設定の配列 */
  hotkeyConfig: HotkeyConfig[]
  
  /** API処理中かどうかのフラグ */
  isLoading: boolean
  
  /** エラーメッセージ（エラーなしの場合はnull） */
  error: string | null
  
  // === 同期アクション ===
  
  /** ピン留めプロンプト一覧を更新 */
  setPinnedPrompts: (prompts: (PinnedPrompt | null)[]) => void
  
  /** 選択中ピン留めプロンプトを更新 */
  setSelectedPinnedPrompt: (prompt: PinnedPrompt | null) => void
  
  /** ホットキー設定を更新 */
  setHotkeyConfig: (config: HotkeyConfig[]) => void
  
  /** ローディング状態を更新 */
  setLoading: (loading: boolean) => void
  
  /** エラー状態を更新 */
  setError: (error: string | null) => void
  
  // === 非同期アクション ===
  
  /** プロンプトを指定位置にピン留め */
  pinPrompt: (request: PinPromptRequest) => Promise<boolean>
  
  /** 指定位置のピン留めを解除 */
  unpinPrompt: (request: UnpinPromptRequest) => Promise<boolean>
  
  /** 指定位置のピン留めプロンプトをクリップボードにコピー */
  copyPinnedPrompt: (request: CopyPinnedPromptRequest) => Promise<boolean>
  
  /** ピン留めプロンプト一覧を読み込み */
  loadPinnedPrompts: (signal?: AbortSignal) => Promise<void>
  
  /** ホットキー設定を読み込み */
  loadHotkeyConfig: () => Promise<void>
  
  /** ホットキー設定を保存 */
  saveHotkeyConfig: (config: HotkeyConfig[]) => Promise<boolean>

  /** ピン留めプロンプト同士の位置を入れ替える、またはピン留めされていないプロンプトで置き換える */
  swapOrReplacePinnedPrompt: (promptId: string, targetPosition: number) => Promise<boolean>
}

/**
 * デフォルトのホットキー設定を生成
 * 1-10の位置に対応するCtrl+数字のショートカットを設定
 */
function createDefaultHotkeyConfig(): HotkeyConfig[] {
  return Array.from({ length: 10 }, (_, index) => ({
    position: index + 1,
    hotkey: `Ctrl+${index === 9 ? 0 : index + 1}`, // Ctrl+1~9, Ctrl+0 for position 10
    enabled: true,
  }))
}

/**
 * 空のピン留めプロンプト配列を生成
 * 10個の位置にnullを設定（1-10の位置に対応）
 */
function createEmptyPinnedPrompts(): (PinnedPrompt | null)[] {
  return Array(10).fill(null)
}

/**
 * お気に入り/ピン留めプロンプト管理用のZustandストア
 * アプリケーション全体のピン留め状態と操作を一元管理
 * Redux DevTools連携でデバッグしやすい設計
 * 
 * @example
 * ```typescript
 * import { useFavoritesStore } from './stores'
 * 
 * function PinnedPromptsComponent() {
 *   const { 
 *     pinnedPrompts, 
 *     pinPrompt, 
 *     unpinPrompt, 
 *     copyPinnedPrompt,
 *     loadPinnedPrompts 
 *   } = useFavoritesStore()
 *   
 *   useEffect(() => {
 *     loadPinnedPrompts()
 *   }, [])
 *   
 *   const handlePin = async (promptId: string, position: number) => {
 *     const success = await pinPrompt({ prompt_id: promptId, position })
 *     if (success) {
 *       console.log('Prompt pinned successfully')
 *     }
 *   }
 * }
 * ```
 */
export const useFavoritesStore = create<FavoritesState>()(
  devtools(
    (set, get) => ({
      // === 初期状態 ===
      pinnedPrompts: createEmptyPinnedPrompts(),
      selectedPinnedPrompt: null,
      hotkeyConfig: createDefaultHotkeyConfig(),
      isLoading: false,
      error: null,

      // === 同期アクション ===
      setPinnedPrompts: (prompts) => set({ pinnedPrompts: prompts }),
      setSelectedPinnedPrompt: (selectedPinnedPrompt) => set({ selectedPinnedPrompt }),
      setHotkeyConfig: (hotkeyConfig) => set({ hotkeyConfig }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // === 非同期アクション ===
      
      /**
       * プロンプトを指定位置にピン留め
       */
      pinPrompt: async (request) => {
        set({ isLoading: true, error: null })
        try {
          logger.debug('Pinning prompt:', request)
          const message = await pinnedPromptsApi.pin(request)
          
          // ピン留め成功後、一覧を再読み込み（操作ロックを無視して強制実行）
          operationLocks.set('loadPinnedPrompts', false) // 既存のロックをクリア
          await get().loadPinnedPrompts()
          
          logger.info('Prompt pinned successfully:', { position: request.position, message })
          set({ isLoading: false })
          return true
        } catch (error) {
          logger.error('Failed to pin prompt:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Unknown error occurred while pinning prompt', 
            isLoading: false 
          })
          return false
        }
      },

      /**
       * 指定位置のピン留めを解除
       */
      unpinPrompt: async (request) => {
        set({ isLoading: true, error: null })
        try {
          logger.debug('Unpinning prompt:', request)
          const message = await pinnedPromptsApi.unpin(request)
          
          // ピン留め解除後、一覧を再読み込み（操作ロックを無視して強制実行）
          operationLocks.set('loadPinnedPrompts', false) // 既存のロックをクリア
          await get().loadPinnedPrompts()
          
          logger.info('Prompt unpinned successfully:', { position: request.position, message })
          set({ isLoading: false })
          return true
        } catch (error) {
          logger.error('Failed to unpin prompt:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Unknown error occurred while unpinning prompt', 
            isLoading: false 
          })
          return false
        }
      },

      /**
       * 指定位置のピン留めプロンプトをクリップボードにコピー
       */
      copyPinnedPrompt: async (request) => {
        set({ isLoading: true, error: null })
        try {
          logger.debug('Copying pinned prompt:', request)
          const message = await pinnedPromptsApi.copyToClipboard(request)
          
          logger.info('Pinned prompt copied successfully:', { position: request.position, message })
          set({ isLoading: false })
          return true
        } catch (error) {
          logger.error('Failed to copy pinned prompt:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Unknown error occurred while copying prompt', 
            isLoading: false 
          })
          return false
        }
      },

      /**
       * ピン留めプロンプト一覧をサーバーから読み込み
       */
      loadPinnedPrompts: async (signal?: AbortSignal) => {
        const lockKey = 'loadPinnedPrompts'
        if (operationLocks.get(lockKey)) {
          logger.warn('Load operation already in progress, skipping')
          return
        }
        
        operationLocks.set(lockKey, true)
        set({ isLoading: true, error: null })
        try {
          logger.debug('Loading pinned prompts from database')
          const pinnedPrompts = await pinnedPromptsApi.getAll(signal)
          
          // Check for cancellation after API call
          if (signal?.aborted) {
            logger.debug('Load pinned prompts operation was cancelled')
            return
          }
          
          // 10個の位置配列を作成し、ピン留めされたプロンプトを適切な位置に配置
          const positionedPrompts = createEmptyPinnedPrompts()
          pinnedPrompts.forEach(prompt => {
            if (prompt.position >= 1 && prompt.position <= 10) {
              positionedPrompts[prompt.position - 1] = prompt
            }
          })
          
          set({ 
            pinnedPrompts: positionedPrompts,
            isLoading: false 
          })
          logger.info(`Loaded ${pinnedPrompts.length} pinned prompts from database`)
        } catch (error) {
          if (signal?.aborted) {
            logger.debug('Load pinned prompts operation was cancelled')
            return
          }
          logger.error('Failed to load pinned prompts:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Unknown error occurred while loading pinned prompts', 
            isLoading: false 
          })
        } finally {
          operationLocks.set(lockKey, false)
        }
      },

      /**
       * ホットキー設定を読み込み
       * 現在はローカルストレージからの読み込みを想定
       * 将来的にはバックエンドAPIと連携予定
       */
      loadHotkeyConfig: async () => {
        set({ isLoading: true, error: null })
        try {
          logger.debug('Loading hotkey configuration')
          
          // ローカルストレージから設定を読み込み
          const savedConfig = localStorage.getItem('prompalette-hotkey-config')
          if (savedConfig) {
            try {
              const config: HotkeyConfig[] = JSON.parse(savedConfig)
              // 設定の妥当性を検証
              if (Array.isArray(config) && config.length === 10 && 
                  config.every(item => item && typeof item.position === 'number' && 
                              typeof item.hotkey === 'string' && 
                              typeof item.enabled === 'boolean')) {
                set({ hotkeyConfig: config })
                logger.info('Hotkey configuration loaded from localStorage')
              } else {
                // 無効な設定の場合はデフォルトを使用
                const defaultConfig = createDefaultHotkeyConfig()
                set({ hotkeyConfig: defaultConfig })
                logger.warn('Invalid hotkey configuration in localStorage, using default')
              }
            } catch (parseError) {
              // JSON解析エラーの場合はデフォルト設定を使用
              const defaultConfig = createDefaultHotkeyConfig()
              set({ hotkeyConfig: defaultConfig })
              logger.error('Failed to parse hotkey configuration from localStorage:', parseError)
            }
          } else {
            // 設定がない場合はデフォルト設定を使用
            const defaultConfig = createDefaultHotkeyConfig()
            set({ hotkeyConfig: defaultConfig })
            logger.info('Using default hotkey configuration')
          }
          
          set({ isLoading: false })
        } catch (error) {
          logger.error('Failed to load hotkey configuration:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Unknown error occurred while loading hotkey configuration', 
            isLoading: false 
          })
        }
      },

      /**
       * ホットキー設定を保存
       * 現在はローカルストレージへの保存を実装
       * 将来的にはバックエンドAPIと連携予定
       */
      saveHotkeyConfig: async (config) => {
        set({ isLoading: true, error: null })
        try {
          logger.debug('Saving hotkey configuration:', config)
          
          // ローカルストレージに保存
          localStorage.setItem('prompalette-hotkey-config', JSON.stringify(config))
          set({ hotkeyConfig: config, isLoading: false })
          
          logger.info('Hotkey configuration saved successfully')
          return true
        } catch (error) {
          logger.error('Failed to save hotkey configuration:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Unknown error occurred while saving hotkey configuration', 
            isLoading: false 
          })
          return false
        }
      },

      /**
       * ピン留めプロンプト同士の位置を入れ替える、またはピン留めされていないプロンプトで置き換える
       * - 両方ともピン留め済み：位置を入れ替える
       * - 片方のみピン留め済み：ピン留めされていない方が新しい位置に移動し、元のプロンプトはピン留め解除
       */
      swapOrReplacePinnedPrompt: async (promptId, targetPosition) => {
        const lockKey = 'swapOrReplacePinnedPrompt'
        if (operationLocks.get(lockKey)) {
          logger.warn('Swap/replace operation already in progress')
          return false
        }
        
        operationLocks.set(lockKey, true)
        set({ isLoading: true, error: null })
        try {
          const currentPinnedPrompts = get().pinnedPrompts
          const targetPrompt = currentPinnedPrompts[targetPosition - 1]
          
          // 現在のプロンプトがピン留めされているか確認
          const currentPromptIndex = currentPinnedPrompts.findIndex(p => p?.id === promptId)
          const isCurrentPromptPinned = currentPromptIndex !== -1

          if (targetPrompt) {
            // ターゲット位置にプロンプトがある場合
            if (isCurrentPromptPinned) {
              // 両方ピン留め済み：位置を入れ替える
              logger.debug('Swapping pinned prompts:', { 
                promptId, 
                targetPosition, 
                currentPosition: currentPromptIndex + 1 
              })

              // 一旦両方をピン留め解除
              await pinnedPromptsApi.unpin({ position: currentPromptIndex + 1 })
              await pinnedPromptsApi.unpin({ position: targetPosition })

              // 入れ替えてピン留め
              await pinnedPromptsApi.pin({ 
                prompt_id: promptId, 
                position: targetPosition 
              })
              await pinnedPromptsApi.pin({ 
                prompt_id: targetPrompt.id, 
                position: currentPromptIndex + 1 
              })
            } else {
              // 現在のプロンプトはピン留めされていない：置き換え
              logger.debug('Replacing pinned prompt:', { 
                promptId, 
                targetPosition, 
                replacedPromptId: targetPrompt.id 
              })

              // ターゲット位置のプロンプトをピン留め解除
              await pinnedPromptsApi.unpin({ position: targetPosition })

              // 新しいプロンプトをピン留め
              await pinnedPromptsApi.pin({ 
                prompt_id: promptId, 
                position: targetPosition 
              })
            }
          } else {
            // ターゲット位置が空の場合：通常のピン留め
            logger.debug('Pinning to empty position:', { promptId, targetPosition })
            
            if (isCurrentPromptPinned) {
              // 現在の位置から移動
              await pinnedPromptsApi.unpin({ position: currentPromptIndex + 1 })
            }
            
            await pinnedPromptsApi.pin({ 
              prompt_id: promptId, 
              position: targetPosition 
            })
          }

          // ピン留め一覧を再読み込み
          await get().loadPinnedPrompts()
          
          logger.info('Prompt position updated successfully')
          set({ isLoading: false })
          return true
        } catch (error) {
          logger.error('Failed to swap/replace pinned prompt:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Unknown error occurred while updating prompt position', 
            isLoading: false 
          })
          return false
        } finally {
          operationLocks.set(lockKey, false)
        }
      },
    }),
    {
      name: 'favorites-store', // Redux DevToolsでの表示名
    }
  )
)
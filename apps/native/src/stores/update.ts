import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { updaterApi } from '../services'
import type { UpdateStatus, UpdateConfig, BackupInfo, BackupResult } from '../types'
import { logger } from '../utils'

// 操作ロック管理用のクラス
class OperationLockManager {
  private locks = new Map<string, { locked: boolean; timestamp: number }>()
  private cleanupInterval: NodeJS.Timeout | null = null
  private readonly LOCK_TIMEOUT = 5 * 60 * 1000 // 5分
  
  constructor() {
    // 定期的に古いロックをクリーンアップ
    this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 1000) // 1分ごと
  }
  
  acquire(key: string): boolean {
    const existing = this.locks.get(key)
    if (existing?.locked) {
      // タイムアウトをチェック
      if (Date.now() - existing.timestamp > this.LOCK_TIMEOUT) {
        // タイムアウトしたロックを解放
        logger.warn(`Lock timeout for key: ${key}, forcibly releasing`)
        this.release(key)
      } else {
        return false
      }
    }
    
    this.locks.set(key, { locked: true, timestamp: Date.now() })
    return true
  }
  
  release(key: string): void {
    this.locks.delete(key)
  }
  
  cleanup(): void {
    const now = Date.now()
    for (const [key, lock] of this.locks.entries()) {
      if (lock.locked && now - lock.timestamp > this.LOCK_TIMEOUT) {
        logger.warn(`Cleaning up stale lock: ${key}`)
        this.locks.delete(key)
      }
    }
  }
  
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.locks.clear()
  }
}

const operationLocks = new OperationLockManager()

/**
 * アップデート管理のグローバル状態インターフェース
 * Zustandストアで管理されるアップデート状態とアクションを定義
 */
interface UpdateState {
  // === 状態プロパティ ===
  
  /** 現在のアップデート状況 */
  updateStatus: UpdateStatus | null
  
  /** アップデート設定情報 */
  updateConfig: UpdateConfig | null
  
  /** 利用可能なバックアップ一覧 */
  backups: BackupInfo[]
  
  /** 最後のバックアップ結果 */
  lastBackupResult: BackupResult | null
  
  /** 自動アップデートチェックが有効かどうか */
  autoCheckEnabled: boolean
  
  /** 最後のアップデートチェック日時 */
  lastChecked: string | null
  
  /** API処理中かどうかのフラグ */
  isLoading: boolean
  
  /** エラーメッセージ（エラーなしの場合はnull） */
  error: string | null
  
  // === 同期アクション ===
  
  /** アップデート状況を更新 */
  setUpdateStatus: (status: UpdateStatus | null) => void
  
  /** アップデート設定を更新 */
  setUpdateConfig: (config: UpdateConfig | null) => void
  
  /** バックアップ一覧を更新 */
  setBackups: (backups: BackupInfo[]) => void
  
  /** 最後のバックアップ結果を更新 */
  setLastBackupResult: (result: BackupResult | null) => void
  
  /** 自動チェック設定を更新 */
  setAutoCheckEnabled: (enabled: boolean) => void
  
  /** ローディング状態を更新 */
  setLoading: (loading: boolean) => void
  
  /** エラー状態を更新 */
  setError: (error: string | null) => void
  
  // === 非同期アクション ===
  
  /** アップデートをチェック */
  checkForUpdates: () => Promise<UpdateStatus>
  
  /** アップデートをダウンロードして適用 */
  downloadAndApplyUpdate: () => Promise<UpdateStatus>
  
  /** 自動バックアップを作成 */
  createBackup: () => Promise<BackupResult>
  
  /** 手動バックアップを作成 */
  createManualBackup: (name?: string) => Promise<BackupResult>
  
  /** バックアップから復元 */
  restoreFromBackup: (backupPath: string) => Promise<boolean>
  
  /** バックアップ一覧を読み込み */
  loadBackups: () => Promise<void>
  
  /** 古いバックアップを削除 */
  cleanupOldBackups: (keepCount?: number) => Promise<number>
  
  /** 特定のバックアップを削除 */
  deleteBackup: (filename: string) => Promise<boolean>
  
  /** アップデート設定を読み込み */
  loadUpdateConfig: () => Promise<void>
  
  /** 定期的なアップデートチェックを初期化 */
  initializeAutoCheck: () => void
  
  /** アップデートチェックを停止 */
  stopAutoCheck: () => void
}

// 自動チェック用のタイマーID
let autoCheckTimer: NodeJS.Timeout | null = null

/**
 * アップデート管理用のZustandストア
 * アプリケーション全体のアップデート状態と操作を一元管理
 * Redux DevTools連携でデバッグしやすい設計
 * 
 * @example
 * ```typescript
 * import { useUpdateStore } from './stores'
 * 
 * function UpdateComponent() {
 *   const { 
 *     updateStatus, 
 *     checkForUpdates, 
 *     downloadAndApplyUpdate,
 *     loadUpdateConfig 
 *   } = useUpdateStore()
 *   
 *   useEffect(() => {
 *     loadUpdateConfig()
 *   }, [])
 *   
 *   const handleCheckUpdates = async () => {
 *     await checkForUpdates()
 *   }
 * }
 * ```
 */
export const useUpdateStore = create<UpdateState>()(
  devtools(
    (set, get) => ({
      // === 初期状態 ===
      updateStatus: null,
      updateConfig: null,
      backups: [],
      lastBackupResult: null,
      autoCheckEnabled: false,
      lastChecked: null,
      isLoading: false,
      error: null,

      // === 同期アクション ===
      setUpdateStatus: (updateStatus) => set({ updateStatus }),
      setUpdateConfig: (updateConfig) => set({ updateConfig }),
      setBackups: (backups) => set({ backups }),
      setLastBackupResult: (lastBackupResult) => set({ lastBackupResult }),
      setAutoCheckEnabled: (autoCheckEnabled) => set({ autoCheckEnabled }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // === 非同期アクション ===
      
      /**
       * アップデートをチェック
       */
      checkForUpdates: async () => {
        const lockKey = 'check_updates'
        if (!operationLocks.acquire(lockKey)) {
          logger.warn('Update check already in progress')
          throw new Error('Update check already in progress')
        }
        
        // Lock acquired in acquire() call above
        set({ isLoading: true, error: null })
        try {
          logger.debug('Checking for updates')
          const status = await updaterApi.checkForUpdates()
          set({ 
            updateStatus: status,
            lastChecked: new Date().toISOString(),
            isLoading: false 
          })
          logger.info('Update check completed:', status)
          return status
        } catch (error) {
          logger.error('Failed to check for updates:', error)
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          set({ 
            error: errorMessage,
            updateStatus: { type: 'Error', message: errorMessage },
            isLoading: false 
          })
          throw error
        } finally {
          operationLocks.release(lockKey)
        }
      },

      /**
       * アップデートをダウンロードして適用
       */
      downloadAndApplyUpdate: async () => {
        const lockKey = 'download_update'
        if (!operationLocks.acquire(lockKey)) {
          logger.warn('Update download already in progress')
          throw new Error('Update download already in progress')
        }
        
        // Lock acquired in acquire() call above
        set({ isLoading: true, error: null })
        try {
          logger.debug('Downloading and applying update')
          const status = await updaterApi.downloadAndApplyUpdate()
          set({ 
            updateStatus: status,
            isLoading: false 
          })
          logger.info('Update download completed:', status)
          return status
        } catch (error) {
          logger.error('Failed to download/apply update:', error)
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          set({ 
            error: errorMessage,
            updateStatus: { type: 'Error', message: errorMessage },
            isLoading: false 
          })
          throw error
        } finally {
          operationLocks.release(lockKey)
        }
      },

      /**
       * 自動バックアップを作成
       */
      createBackup: async () => {
        const lockKey = 'create_backup'
        if (!operationLocks.acquire(lockKey)) {
          logger.warn('Backup creation already in progress')
          throw new Error('Backup creation already in progress')
        }
        
        // Lock acquired in acquire() call above
        set({ isLoading: true, error: null })
        try {
          logger.debug('Creating backup')
          const result = await updaterApi.createBackup()
          set({ 
            lastBackupResult: result,
            isLoading: false 
          })
          
          // バックアップ一覧を更新
          if (result.success) {
            await get().loadBackups()
          }
          
          logger.info('Backup creation completed:', result)
          return result
        } catch (error) {
          logger.error('Failed to create backup:', error)
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          const failedResult: BackupResult = {
            success: false,
            timestamp: new Date().toISOString(),
            error: errorMessage
          }
          set({ 
            error: errorMessage,
            lastBackupResult: failedResult,
            isLoading: false 
          })
          throw error
        } finally {
          operationLocks.release(lockKey)
        }
      },

      /**
       * 手動バックアップを作成
       */
      createManualBackup: async (name?: string) => {
        const lockKey = 'create_manual_backup'
        if (!operationLocks.acquire(lockKey)) {
          logger.warn('Manual backup creation already in progress')
          throw new Error('Manual backup creation already in progress')
        }
        
        // Lock acquired in acquire() call above
        set({ isLoading: true, error: null })
        try {
          logger.debug('Creating manual backup:', { name })
          const result = await updaterApi.createManualBackup(name)
          set({ 
            lastBackupResult: result,
            isLoading: false 
          })
          
          // バックアップ一覧を更新
          if (result.success) {
            await get().loadBackups()
          }
          
          logger.info('Manual backup creation completed:', result)
          return result
        } catch (error) {
          logger.error('Failed to create manual backup:', error)
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          const failedResult: BackupResult = {
            success: false,
            timestamp: new Date().toISOString(),
            error: errorMessage
          }
          set({ 
            error: errorMessage,
            lastBackupResult: failedResult,
            isLoading: false 
          })
          throw error
        } finally {
          operationLocks.release(lockKey)
        }
      },

      /**
       * バックアップから復元
       */
      restoreFromBackup: async (backupPath: string) => {
        const lockKey = 'restore_backup'
        if (!operationLocks.acquire(lockKey)) {
          logger.warn('Backup restore already in progress')
          throw new Error('Backup restore already in progress')
        }
        
        // Lock acquired in acquire() call above
        set({ isLoading: true, error: null })
        try {
          logger.debug('Restoring from backup:', backupPath)
          const success = await updaterApi.restoreFromBackup(backupPath)
          set({ isLoading: false })
          logger.info('Backup restore completed:', success)
          return success
        } catch (error) {
          logger.error('Failed to restore from backup:', error)
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          set({ 
            error: errorMessage,
            isLoading: false 
          })
          throw error
        } finally {
          operationLocks.release(lockKey)
        }
      },

      /**
       * バックアップ一覧を読み込み
       */
      loadBackups: async () => {
        const lockKey = 'load_backups'
        if (!operationLocks.acquire(lockKey)) {
          logger.warn('Load backups already in progress')
          return
        }
        
        // Lock acquired in acquire() call above
        set({ isLoading: true, error: null })
        try {
          logger.debug('Loading backups')
          const backups = await updaterApi.listBackups()
          set({ 
            backups,
            isLoading: false 
          })
          logger.info(`Loaded ${backups.length} backups`)
        } catch (error) {
          logger.error('Failed to load backups:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false 
          })
        } finally {
          operationLocks.release(lockKey)
        }
      },

      /**
       * 古いバックアップを削除
       */
      cleanupOldBackups: async (keepCount?: number) => {
        const lockKey = 'cleanup_backups'
        if (!operationLocks.acquire(lockKey)) {
          logger.warn('Backup cleanup already in progress')
          throw new Error('Backup cleanup already in progress')
        }
        
        // Lock acquired in acquire() call above
        set({ isLoading: true, error: null })
        try {
          logger.debug('Cleaning up old backups:', { keepCount })
          const deletedCount = await updaterApi.cleanupOldBackups(keepCount)
          
          // バックアップ一覧を更新
          await get().loadBackups()
          
          set({ isLoading: false })
          logger.info(`Cleanup completed, deleted ${deletedCount} backups`)
          return deletedCount
        } catch (error) {
          logger.error('Failed to cleanup backups:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false 
          })
          throw error
        } finally {
          operationLocks.release(lockKey)
        }
      },

      /**
       * 特定のバックアップを削除
       */
      deleteBackup: async (filename: string) => {
        const lockKey = `delete_backup_${filename}`
        if (!operationLocks.acquire(lockKey)) {
          logger.warn(`Delete backup already in progress: ${filename}`)
          throw new Error(`Delete backup already in progress: ${filename}`)
        }
        
        // Lock acquired in acquire() call above
        set({ isLoading: true, error: null })
        try {
          logger.debug('Deleting backup:', filename)
          const success = await updaterApi.deleteBackup(filename)
          
          if (success) {
            // バックアップ一覧を更新
            await get().loadBackups()
          }
          
          set({ isLoading: false })
          logger.info('Backup deletion completed:', { filename, success })
          return success
        } catch (error) {
          logger.error('Failed to delete backup:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false 
          })
          throw error
        } finally {
          operationLocks.release(lockKey)
        }
      },

      /**
       * アップデート設定を読み込み
       */
      loadUpdateConfig: async () => {
        const lockKey = 'load_config'
        if (!operationLocks.acquire(lockKey)) {
          logger.warn('Load config already in progress')
          return
        }
        
        // Lock acquired in acquire() call above
        set({ isLoading: true, error: null })
        try {
          logger.debug('Loading update config')
          const config = await updaterApi.getUpdateConfig()
          set({ 
            updateConfig: config,
            autoCheckEnabled: config.auto_check_enabled,
            isLoading: false 
          })
          logger.info('Update config loaded:', config)
        } catch (error) {
          logger.error('Failed to load update config:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false 
          })
        } finally {
          operationLocks.release(lockKey)
        }
      },

      /**
       * 定期的なアップデートチェックを初期化
       */
      initializeAutoCheck: () => {
        const state = get()
        if (!state.autoCheckEnabled || !state.updateConfig?.updates_enabled) {
          return
        }

        // 既存のタイマーをクリア
        if (autoCheckTimer) {
          clearInterval(autoCheckTimer)
        }

        // 1時間ごとにアップデートをチェック
        autoCheckTimer = setInterval(async () => {
          const currentState = get()
          if (currentState.autoCheckEnabled && currentState.updateConfig?.updates_enabled) {
            try {
              await currentState.checkForUpdates()
            } catch (error) {
              logger.error('Auto update check failed:', error)
            }
          }
        }, 60 * 60 * 1000) // 1時間

        logger.info('Auto update check initialized')
      },

      /**
       * アップデートチェックを停止
       */
      stopAutoCheck: () => {
        if (autoCheckTimer) {
          clearInterval(autoCheckTimer)
          autoCheckTimer = null
          logger.info('Auto update check stopped')
        }
      },
    }),
    {
      name: 'update-store', // Redux DevToolsでの表示名
    }
  )
)

// アプリケーション終了時のクリーンアップ関数
export const cleanupUpdateStore = () => {
  useUpdateStore.getState().stopAutoCheck()
  operationLocks.destroy()
}
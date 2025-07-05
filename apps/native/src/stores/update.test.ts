import { beforeEach, describe, it, expect, vi, afterEach } from 'vitest'

import { updaterApi } from '../services'
import type { UpdateStatus, UpdateConfig, BackupInfo, BackupResult } from '../types'

import { useUpdateStore } from './update'

// Mock the updater API
vi.mock('../services', () => ({
  updaterApi: {
    checkForUpdates: vi.fn(),
    downloadAndApplyUpdate: vi.fn(),
    createBackup: vi.fn(),
    createManualBackup: vi.fn(),
    restoreFromBackup: vi.fn(),
    listBackups: vi.fn(),
    cleanupOldBackups: vi.fn(),
    deleteBackup: vi.fn(),
    getUpdateConfig: vi.fn(),
  }
}))

// Mock logger
vi.mock('../utils', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }
}))

const mockUpdaterApi = updaterApi as any

describe('Update Store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset store state before each test
    const store = useUpdateStore.getState()
    store.setUpdateStatus(null)
    store.setUpdateConfig(null)
    store.setBackups([])
    store.setLastBackupResult(null)
    store.setAutoCheckEnabled(false)
    store.setLoading(false)
    store.setError(null)
  })

  afterEach(() => {
    // Stop any auto check timers
    const store = useUpdateStore.getState()
    store.stopAutoCheck()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useUpdateStore.getState()
      
      expect(state.updateStatus).toBeNull()
      expect(state.updateConfig).toBeNull()
      expect(state.backups).toEqual([])
      expect(state.lastBackupResult).toBeNull()
      expect(state.autoCheckEnabled).toBe(false)
      expect(state.lastChecked).toBeNull()
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('Sync Actions', () => {
    it('should update update status', () => {
      const store = useUpdateStore.getState()
      const status: UpdateStatus = { type: 'NoUpdateAvailable' }
      
      store.setUpdateStatus(status)
      
      expect(useUpdateStore.getState().updateStatus).toBe(status)
    })

    it('should update config', () => {
      const store = useUpdateStore.getState()
      const config: UpdateConfig = {
        environment: 'production',
        updatesEnabled: true,
        autoCheckEnabled: true,
        requiresManualApproval: true,
        backupEnabled: true
      }
      
      store.setUpdateConfig(config)
      
      expect(useUpdateStore.getState().updateConfig).toBe(config)
    })

    it('should update backups list', () => {
      const store = useUpdateStore.getState()
      const backups: BackupInfo[] = [
        {
          filename: 'test_backup.db',
          full_path: '/path/to/test_backup.db',
          created_at: '2024-01-01T00:00:00Z',
          size_bytes: 1024,
          is_automatic: true
        }
      ]
      
      store.setBackups(backups)
      
      expect(useUpdateStore.getState().backups).toBe(backups)
    })

    it('should update last backup result', () => {
      const store = useUpdateStore.getState()
      const result: BackupResult = {
        success: true,
        backup_path: '/path/to/backup.db',
        timestamp: '2024-01-01T00:00:00Z'
      }
      
      store.setLastBackupResult(result)
      
      expect(useUpdateStore.getState().lastBackupResult).toBe(result)
    })

    it('should update loading state', () => {
      const store = useUpdateStore.getState()
      
      store.setLoading(true)
      expect(useUpdateStore.getState().isLoading).toBe(true)
      
      store.setLoading(false)
      expect(useUpdateStore.getState().isLoading).toBe(false)
    })

    it('should update error state', () => {
      const store = useUpdateStore.getState()
      const error = 'Test error'
      
      store.setError(error)
      expect(useUpdateStore.getState().error).toBe(error)
      
      store.setError(null)
      expect(useUpdateStore.getState().error).toBeNull()
    })
  })

  describe('Async Actions', () => {
    describe('checkForUpdates', () => {
      it('should check for updates successfully', async () => {
        const updateStatus: UpdateStatus = { type: 'NoUpdateAvailable' }
        mockUpdaterApi.checkForUpdates.mockResolvedValue(updateStatus)
        
        const store = useUpdateStore.getState()
        const result = await store.checkForUpdates()
        
        expect(mockUpdaterApi.checkForUpdates).toHaveBeenCalled()
        expect(result).toBe(updateStatus)
        expect(useUpdateStore.getState().updateStatus).toBe(updateStatus)
        expect(useUpdateStore.getState().lastChecked).toBeTruthy()
        expect(useUpdateStore.getState().isLoading).toBe(false)
        expect(useUpdateStore.getState().error).toBeNull()
      })

      it('should handle check updates error', async () => {
        const error = new Error('Check failed')
        mockUpdaterApi.checkForUpdates.mockRejectedValue(error)
        
        const store = useUpdateStore.getState()
        
        await expect(store.checkForUpdates()).rejects.toThrow('Check failed')
        
        expect(useUpdateStore.getState().error).toBe('Check failed')
        expect(useUpdateStore.getState().updateStatus).toEqual({
          type: 'Error',
          message: 'Check failed'
        })
        expect(useUpdateStore.getState().isLoading).toBe(false)
      })
    })

    describe('downloadAndApplyUpdate', () => {
      it('should download and apply update successfully', async () => {
        const updateStatus: UpdateStatus = { type: 'Installing' }
        mockUpdaterApi.downloadAndApplyUpdate.mockResolvedValue(updateStatus)
        
        const store = useUpdateStore.getState()
        const result = await store.downloadAndApplyUpdate()
        
        expect(mockUpdaterApi.downloadAndApplyUpdate).toHaveBeenCalled()
        expect(result).toBe(updateStatus)
        expect(useUpdateStore.getState().updateStatus).toBe(updateStatus)
        expect(useUpdateStore.getState().isLoading).toBe(false)
        expect(useUpdateStore.getState().error).toBeNull()
      })

      it('should handle download update error', async () => {
        const error = new Error('Download failed')
        mockUpdaterApi.downloadAndApplyUpdate.mockRejectedValue(error)
        
        const store = useUpdateStore.getState()
        
        await expect(store.downloadAndApplyUpdate()).rejects.toThrow('Download failed')
        
        expect(useUpdateStore.getState().error).toBe('Download failed')
        expect(useUpdateStore.getState().updateStatus).toEqual({
          type: 'Error',
          message: 'Download failed'
        })
        expect(useUpdateStore.getState().isLoading).toBe(false)
      })
    })

    describe('createBackup', () => {
      it('should create backup successfully', async () => {
        const backupResult: BackupResult = {
          success: true,
          backup_path: '/path/to/backup.db',
          timestamp: '2024-01-01T00:00:00Z'
        }
        mockUpdaterApi.createBackup.mockResolvedValue(backupResult)
        mockUpdaterApi.listBackups.mockResolvedValue([])
        
        const store = useUpdateStore.getState()
        const result = await store.createBackup()
        
        expect(mockUpdaterApi.createBackup).toHaveBeenCalled()
        expect(result).toBe(backupResult)
        expect(useUpdateStore.getState().lastBackupResult).toBe(backupResult)
        expect(useUpdateStore.getState().isLoading).toBe(false)
        expect(useUpdateStore.getState().error).toBeNull()
      })

      it('should handle backup creation error', async () => {
        const error = new Error('Backup failed')
        mockUpdaterApi.createBackup.mockRejectedValue(error)
        
        const store = useUpdateStore.getState()
        
        await expect(store.createBackup()).rejects.toThrow('Backup failed')
        
        expect(useUpdateStore.getState().error).toBe('Backup failed')
        expect(useUpdateStore.getState().lastBackupResult?.success).toBe(false)
        expect(useUpdateStore.getState().isLoading).toBe(false)
      })
    })

    describe('createManualBackup', () => {
      it('should create manual backup with name', async () => {
        const backupResult: BackupResult = {
          success: true,
          backup_path: '/path/to/manual_backup.db',
          timestamp: '2024-01-01T00:00:00Z'
        }
        mockUpdaterApi.createManualBackup.mockResolvedValue(backupResult)
        mockUpdaterApi.listBackups.mockResolvedValue([])
        
        const store = useUpdateStore.getState()
        const result = await store.createManualBackup('test_backup')
        
        expect(mockUpdaterApi.createManualBackup).toHaveBeenCalledWith('test_backup')
        expect(result).toBe(backupResult)
        expect(useUpdateStore.getState().lastBackupResult).toBe(backupResult)
      })

      it('should create manual backup without name', async () => {
        const backupResult: BackupResult = {
          success: true,
          backup_path: '/path/to/manual_backup.db',
          timestamp: '2024-01-01T00:00:00Z'
        }
        mockUpdaterApi.createManualBackup.mockResolvedValue(backupResult)
        mockUpdaterApi.listBackups.mockResolvedValue([])
        
        const store = useUpdateStore.getState()
        const result = await store.createManualBackup()
        
        expect(mockUpdaterApi.createManualBackup).toHaveBeenCalledWith(undefined)
        expect(result).toBe(backupResult)
      })
    })

    describe('restoreFromBackup', () => {
      it('should restore from backup successfully', async () => {
        mockUpdaterApi.restoreFromBackup.mockResolvedValue(true)
        
        const store = useUpdateStore.getState()
        const result = await store.restoreFromBackup('/path/to/backup.db')
        
        expect(mockUpdaterApi.restoreFromBackup).toHaveBeenCalledWith('/path/to/backup.db')
        expect(result).toBe(true)
        expect(useUpdateStore.getState().isLoading).toBe(false)
        expect(useUpdateStore.getState().error).toBeNull()
      })

      it('should handle restore error', async () => {
        const error = new Error('Restore failed')
        mockUpdaterApi.restoreFromBackup.mockRejectedValue(error)
        
        const store = useUpdateStore.getState()
        
        await expect(store.restoreFromBackup('/path/to/backup.db')).rejects.toThrow('Restore failed')
        
        expect(useUpdateStore.getState().error).toBe('Restore failed')
        expect(useUpdateStore.getState().isLoading).toBe(false)
      })
    })

    describe('loadBackups', () => {
      it('should load backups successfully', async () => {
        const backups: BackupInfo[] = [
          {
            filename: 'test_backup.db',
            full_path: '/path/to/test_backup.db',
            created_at: '2024-01-01T00:00:00Z',
            size_bytes: 1024,
            is_automatic: true
          }
        ]
        mockUpdaterApi.listBackups.mockResolvedValue(backups)
        
        const store = useUpdateStore.getState()
        await store.loadBackups()
        
        expect(mockUpdaterApi.listBackups).toHaveBeenCalled()
        expect(useUpdateStore.getState().backups).toBe(backups)
        expect(useUpdateStore.getState().isLoading).toBe(false)
        expect(useUpdateStore.getState().error).toBeNull()
      })

      it('should handle load backups error', async () => {
        const error = new Error('Load failed')
        mockUpdaterApi.listBackups.mockRejectedValue(error)
        
        const store = useUpdateStore.getState()
        await store.loadBackups()
        
        expect(useUpdateStore.getState().error).toBe('Load failed')
        expect(useUpdateStore.getState().isLoading).toBe(false)
      })
    })

    describe('cleanupOldBackups', () => {
      it('should cleanup old backups successfully', async () => {
        mockUpdaterApi.cleanupOldBackups.mockResolvedValue(5)
        mockUpdaterApi.listBackups.mockResolvedValue([])
        
        const store = useUpdateStore.getState()
        const result = await store.cleanupOldBackups(10)
        
        expect(mockUpdaterApi.cleanupOldBackups).toHaveBeenCalledWith(10)
        expect(result).toBe(5)
        expect(useUpdateStore.getState().isLoading).toBe(false)
        expect(useUpdateStore.getState().error).toBeNull()
      })
    })

    describe('deleteBackup', () => {
      it('should delete backup successfully', async () => {
        mockUpdaterApi.deleteBackup.mockResolvedValue(true)
        mockUpdaterApi.listBackups.mockResolvedValue([])
        
        const store = useUpdateStore.getState()
        const result = await store.deleteBackup('test_backup.db')
        
        expect(mockUpdaterApi.deleteBackup).toHaveBeenCalledWith('test_backup.db')
        expect(result).toBe(true)
        expect(useUpdateStore.getState().isLoading).toBe(false)
        expect(useUpdateStore.getState().error).toBeNull()
      })
    })

    describe('loadUpdateConfig', () => {
      it('should load update config successfully', async () => {
        const config: UpdateConfig = {
          environment: 'production',
          updates_enabled: true,
          auto_check_enabled: true,
          requires_manual_approval: true,
          backup_enabled: true
        }
        mockUpdaterApi.getUpdateConfig.mockResolvedValue(config)
        
        const store = useUpdateStore.getState()
        await store.loadUpdateConfig()
        
        expect(mockUpdaterApi.getUpdateConfig).toHaveBeenCalled()
        expect(useUpdateStore.getState().updateConfig).toBe(config)
        expect(useUpdateStore.getState().autoCheckEnabled).toBe(true)
        expect(useUpdateStore.getState().isLoading).toBe(false)
        expect(useUpdateStore.getState().error).toBeNull()
      })
    })
  })

  describe('Operation Locks', () => {
    it('should prevent concurrent update checks', async () => {
      mockUpdaterApi.checkForUpdates.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ type: 'NoUpdateAvailable' }), 100))
      )
      
      const store = useUpdateStore.getState()
      
      // Start first check
      const promise1 = store.checkForUpdates()
      
      // Try to start second check immediately
      await expect(store.checkForUpdates()).rejects.toThrow('Update check already in progress')
      
      // Wait for first check to complete
      await promise1
      
      expect(mockUpdaterApi.checkForUpdates).toHaveBeenCalledTimes(1)
    })

    it('should prevent concurrent backup creation', async () => {
      mockUpdaterApi.createBackup.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          timestamp: '2024-01-01T00:00:00Z'
        }), 100))
      )
      mockUpdaterApi.listBackups.mockResolvedValue([])
      
      const store = useUpdateStore.getState()
      
      // Start first backup
      const promise1 = store.createBackup()
      
      // Try to start second backup immediately
      await expect(store.createBackup()).rejects.toThrow('Backup creation already in progress')
      
      // Wait for first backup to complete
      await promise1
      
      expect(mockUpdaterApi.createBackup).toHaveBeenCalledTimes(1)
    })
  })

  describe('Auto Check', () => {
    it('should initialize auto check when enabled', () => {
      const store = useUpdateStore.getState()
      
      // Set up config and enable auto check
      store.setUpdateConfig({
        environment: 'production',
        updates_enabled: true,
        auto_check_enabled: true,
        requires_manual_approval: true,
        backup_enabled: true
      })
      store.setAutoCheckEnabled(true)
      
      // Initialize auto check
      store.initializeAutoCheck()
      
      // Should not throw or cause issues
      expect(true).toBe(true)
      
      // Clean up
      store.stopAutoCheck()
    })

    it('should stop auto check', () => {
      const store = useUpdateStore.getState()
      
      // Initialize and then stop
      store.initializeAutoCheck()
      store.stopAutoCheck()
      
      // Should not throw or cause issues
      expect(true).toBe(true)
    })
  })
})
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

import { updaterApi } from '../../services/api'
import type { BackupInfo, BackupResult } from '../../types'

import { BackupManager } from './BackupManager'

// Mock the updater API
vi.mock('../../services/api', () => ({
  updaterApi: {
    listBackups: vi.fn(),
    createManualBackup: vi.fn(),
    deleteBackup: vi.fn(),
    restoreFromBackup: vi.fn(),
    cleanupOldBackups: vi.fn(),
  }
}))

const mockUpdaterApi = vi.mocked(updaterApi)

describe('BackupManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockBackups: BackupInfo[] = [
    {
      filename: 'manual_test_20240101_120000.db',
      full_path: '/path/to/manual_test_20240101_120000.db',
      created_at: '2024-01-01T12:00:00Z',
      size_bytes: 1024000,
      is_automatic: false
    },
    {
      filename: 'prompalette_backup_20240101_100000.db',
      full_path: '/path/to/prompalette_backup_20240101_100000.db',
      created_at: '2024-01-01T10:00:00Z',
      size_bytes: 512000,
      is_automatic: true
    }
  ]

  it('should load and display backup list on mount', async () => {
    mockUpdaterApi.listBackups.mockResolvedValue(mockBackups)

    render(<BackupManager />)

    await waitFor(() => {
      expect(mockUpdaterApi.listBackups).toHaveBeenCalled()
    })

    expect(screen.getByText('バックアップ一覧 (2件)')).toBeInTheDocument()
    expect(screen.getByText('manual_test_20240101_120000.db')).toBeInTheDocument()
    expect(screen.getByText('prompalette_backup_20240101_100000.db')).toBeInTheDocument()
  })

  it('should display backup types correctly', async () => {
    mockUpdaterApi.listBackups.mockResolvedValue(mockBackups)

    render(<BackupManager />)

    await waitFor(() => {
      expect(screen.getByText('手動')).toBeInTheDocument()
      expect(screen.getByText('自動')).toBeInTheDocument()
    })
  })

  it('should format file sizes correctly', async () => {
    mockUpdaterApi.listBackups.mockResolvedValue(mockBackups)

    render(<BackupManager />)

    await waitFor(() => {
      expect(screen.getByText('サイズ: 1000 KB')).toBeInTheDocument()
      expect(screen.getByText('サイズ: 500 KB')).toBeInTheDocument()
    })
  })

  it('should create manual backup with custom name', async () => {
    mockUpdaterApi.listBackups.mockResolvedValue([])
    const successResult: BackupResult = {
      success: true,
      backup_path: '/path/to/manual_test_backup.db',
      timestamp: '2024-01-01T12:00:00Z'
    }
    
    // Add a delay to see the loading state
    mockUpdaterApi.createManualBackup.mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve(successResult), 100))
    )

    render(<BackupManager />)

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('バックアップ一覧 (0件)')).toBeInTheDocument()
    })

    const nameInput = screen.getByPlaceholderText('バックアップ名（任意）')
    const createButton = screen.getByText('バックアップ作成')

    fireEvent.change(nameInput, { target: { value: 'test_backup' } })
    fireEvent.click(createButton)

    // Check loading state immediately
    expect(screen.getByText('作成中...')).toBeInTheDocument()

    await waitFor(() => {
      expect(mockUpdaterApi.createManualBackup).toHaveBeenCalledWith('test_backup')
    })
  })

  it('should create manual backup without custom name', async () => {
    mockUpdaterApi.listBackups.mockResolvedValue([])
    const successResult: BackupResult = {
      success: true,
      backup_path: '/path/to/manual_backup.db',
      timestamp: '2024-01-01T12:00:00Z'
    }
    mockUpdaterApi.createManualBackup.mockResolvedValue(successResult)

    render(<BackupManager />)

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('バックアップ一覧 (0件)')).toBeInTheDocument()
    })

    const createButton = screen.getByText('バックアップ作成')
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(mockUpdaterApi.createManualBackup).toHaveBeenCalledWith(undefined)
    })
  })

  it('should handle backup creation failure', async () => {
    mockUpdaterApi.listBackups.mockResolvedValue([])
    const failureResult: BackupResult = {
      success: false,
      timestamp: '2024-01-01T12:00:00Z',
      error: 'Disk full'
    }
    mockUpdaterApi.createManualBackup.mockResolvedValue(failureResult)

    render(<BackupManager />)

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('バックアップ一覧 (0件)')).toBeInTheDocument()
    })

    const createButton = screen.getByText('バックアップ作成')
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(mockUpdaterApi.createManualBackup).toHaveBeenCalled()
    })
  })

  it('should delete backup after confirmation', async () => {
    mockUpdaterApi.listBackups.mockResolvedValue(mockBackups)
    mockUpdaterApi.deleteBackup.mockResolvedValue(true)

    render(<BackupManager />)

    await waitFor(() => {
      expect(screen.getByText('manual_test_20240101_120000.db')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByText('削除')
    fireEvent.click(deleteButtons[0])

    // 確認モーダルが表示される
    expect(screen.getByText('バックアップの削除')).toBeInTheDocument()
    expect(screen.getByText(/「manual_test_20240101_120000.db」を削除しますか？/)).toBeInTheDocument()

    // 削除を確認（すべての削除ボタンから最後のもの=モーダル内のものを取得）
    const allDeleteButtons = screen.getAllByText('削除')
    const confirmButton = allDeleteButtons[allDeleteButtons.length - 1]
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(mockUpdaterApi.deleteBackup).toHaveBeenCalledWith('manual_test_20240101_120000.db')
    })
  })

  it('should cancel backup deletion', async () => {
    mockUpdaterApi.listBackups.mockResolvedValue(mockBackups)

    render(<BackupManager />)

    await waitFor(() => {
      expect(screen.getByText('manual_test_20240101_120000.db')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByText('削除')
    fireEvent.click(deleteButtons[0])

    // キャンセルボタンをクリック
    const cancelButton = screen.getByText('キャンセル')
    fireEvent.click(cancelButton)

    expect(mockUpdaterApi.deleteBackup).not.toHaveBeenCalled()
  })

  it('should restore backup', async () => {
    mockUpdaterApi.listBackups.mockResolvedValue(mockBackups)
    mockUpdaterApi.restoreFromBackup.mockResolvedValue(true)

    render(<BackupManager />)

    await waitFor(() => {
      expect(screen.getByText('manual_test_20240101_120000.db')).toBeInTheDocument()
    })

    const restoreButtons = screen.getAllByText('復元')
    fireEvent.click(restoreButtons[0])

    await waitFor(() => {
      expect(mockUpdaterApi.restoreFromBackup).toHaveBeenCalledWith('/path/to/manual_test_20240101_120000.db')
    })
  })

  it('should cleanup old backups', async () => {
    mockUpdaterApi.listBackups.mockResolvedValue(mockBackups)
    mockUpdaterApi.cleanupOldBackups.mockResolvedValue(3)

    render(<BackupManager />)

    const cleanupButton = screen.getByText('古いバックアップを削除')
    fireEvent.click(cleanupButton)

    await waitFor(() => {
      expect(mockUpdaterApi.cleanupOldBackups).toHaveBeenCalledWith(10)
    })
  })

  it('should refresh backup list', async () => {
    mockUpdaterApi.listBackups.mockResolvedValue(mockBackups)

    render(<BackupManager />)

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('manual_test_20240101_120000.db')).toBeInTheDocument()
    })

    // Clear the initial call
    mockUpdaterApi.listBackups.mockClear()

    const refreshButton = screen.getByText('一覧を更新')
    fireEvent.click(refreshButton)

    await waitFor(() => {
      expect(mockUpdaterApi.listBackups).toHaveBeenCalledTimes(1)
    })
  })

  it('should show empty state when no backups exist', async () => {
    mockUpdaterApi.listBackups.mockResolvedValue([])

    render(<BackupManager />)

    await waitFor(() => {
      expect(screen.getByText('バックアップが見つかりませんでした')).toBeInTheDocument()
      expect(screen.getByText('バックアップ一覧 (0件)')).toBeInTheDocument()
    })
  })

  it('should format dates correctly', async () => {
    mockUpdaterApi.listBackups.mockResolvedValue(mockBackups)

    render(<BackupManager />)

    await waitFor(() => {
      // Check that dates are formatted (exact format may vary by locale)
      const dateElements = screen.getAllByText(/作成日時: 2024/)
      expect(dateElements.length).toBeGreaterThan(0)
    })
  })
})
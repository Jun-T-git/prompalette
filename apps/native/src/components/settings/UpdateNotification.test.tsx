import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

import { updaterApi } from '../../services/api'
import type { UpdateStatus, BackupResult } from '../../types'

import { UpdateNotification } from './UpdateNotification'

// Mock the updater API
vi.mock('../../services/api', () => ({
  updaterApi: {
    checkForUpdates: vi.fn(),
    createBackup: vi.fn(),
    downloadAndApplyUpdate: vi.fn(),
  }
}))

// Mock Tauri API
vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn(() => Promise.resolve(() => {}))
}))

const mockUpdaterApi = updaterApi as any

describe('UpdateNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock window.__TAURI_INTERNALS__ for Tauri environment check
    Object.defineProperty(window, '__TAURI_INTERNALS__', {
      value: {},
      configurable: true
    })
  })

  afterEach(() => {
    // Clean up the mock
    delete (window as any).__TAURI_INTERNALS__
  })

  it('should not render when no update is available', async () => {
    const noUpdateStatus: UpdateStatus = { type: 'NoUpdateAvailable' }
    mockUpdaterApi.checkForUpdates.mockResolvedValue(noUpdateStatus)

    const { container } = render(<UpdateNotification />)
    
    await waitFor(() => {
      expect(mockUpdaterApi.checkForUpdates).toHaveBeenCalled()
    })

    expect(container.firstChild).toBeNull()
  })

  it('should display error message when update check fails', async () => {
    const errorStatus: UpdateStatus = { 
      type: 'Error', 
      message: 'Network error' 
    }
    mockUpdaterApi.checkForUpdates.mockResolvedValue(errorStatus)

    render(<UpdateNotification />)
    
    await waitFor(() => {
      expect(screen.getByText('アップデートエラー')).toBeInTheDocument()
      expect(screen.getByText('Network error')).toBeInTheDocument()
      expect(screen.getByText('再試行')).toBeInTheDocument()
    })
  })

  it('should display update available notification with version info', async () => {
    const updateAvailableStatus: UpdateStatus = {
      type: 'UpdateAvailable',
      info: {
        version: '2.0.0',
        notes: '### New Features\n- Feature 1\n- Feature 2',
        pub_date: '2024-01-01T00:00:00Z',
        url: 'https://example.com/update',
        signature: 'signature'
      }
    }
    mockUpdaterApi.checkForUpdates.mockResolvedValue(updateAvailableStatus)

    render(<UpdateNotification />)
    
    await waitFor(() => {
      expect(screen.getByText('新しいバージョンが利用可能です')).toBeInTheDocument()
      expect(screen.getByText('バージョン 2.0.0')).toBeInTheDocument()
      expect(screen.getByText('アップデートする')).toBeInTheDocument()
      expect(screen.getByText('再チェック')).toBeInTheDocument()
    })
  })

  it('should format release notes correctly', async () => {
    const updateAvailableStatus: UpdateStatus = {
      type: 'UpdateAvailable',
      info: {
        version: '2.0.0',
        notes: '### New Features\n- Feature 1\n- Feature 2\n### Bug Fixes\n- Fix 1',
        url: 'https://example.com/update'
      }
    }
    mockUpdaterApi.checkForUpdates.mockResolvedValue(updateAvailableStatus)

    render(<UpdateNotification />)
    
    await waitFor(() => {
      expect(screen.getByText('リリースノート:')).toBeInTheDocument()
      expect(screen.getByText(/New Features/)).toBeInTheDocument()
      expect(screen.getByText(/• Feature 1/)).toBeInTheDocument()
    })
  })

  it('should handle update process with backup', async () => {
    const updateAvailableStatus: UpdateStatus = {
      type: 'UpdateAvailable',
      info: {
        version: '2.0.0',
        url: 'https://example.com/update'
      }
    }
    
    const backupResult: BackupResult = {
      success: true,
      backup_path: '/path/to/backup.db',
      timestamp: '2024-01-01T00:00:00Z'
    }

    const installingStatus: UpdateStatus = { type: 'Installing' }

    mockUpdaterApi.checkForUpdates.mockResolvedValue(updateAvailableStatus)
    
    // Add a delay to createBackup to ensure we can catch the updating state
    mockUpdaterApi.createBackup.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(backupResult), 100))
    )
    mockUpdaterApi.downloadAndApplyUpdate.mockResolvedValue(installingStatus)

    render(<UpdateNotification />)
    
    await waitFor(() => {
      expect(screen.getByText('アップデートする')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('アップデートする'))

    // Check that the button text changes to updating state immediately
    expect(screen.getByText('アップデート中...')).toBeInTheDocument()

    // Wait for the update process to complete
    await waitFor(() => {
      expect(mockUpdaterApi.createBackup).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(mockUpdaterApi.downloadAndApplyUpdate).toHaveBeenCalled()
    })
  })

  it('should handle backup failure during update', async () => {
    const updateAvailableStatus: UpdateStatus = {
      type: 'UpdateAvailable',
      info: {
        version: '2.0.0',
        url: 'https://example.com/update'
      }
    }
    
    const backupResult: BackupResult = {
      success: false,
      error: 'Disk full',
      timestamp: '2024-01-01T00:00:00Z'
    }

    mockUpdaterApi.checkForUpdates.mockResolvedValue(updateAvailableStatus)
    mockUpdaterApi.createBackup.mockResolvedValue(backupResult)

    render(<UpdateNotification />)
    
    await waitFor(() => {
      expect(screen.getByText('アップデートする')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('アップデートする'))

    await waitFor(() => {
      expect(mockUpdaterApi.createBackup).toHaveBeenCalled()
      expect(mockUpdaterApi.downloadAndApplyUpdate).not.toHaveBeenCalled()
    })
  })

  it('should call onClose when provided', async () => {
    const onCloseMock = vi.fn()
    const updateAvailableStatus: UpdateStatus = {
      type: 'UpdateAvailable',
      info: {
        version: '2.0.0',
        url: 'https://example.com/update'
      }
    }

    mockUpdaterApi.checkForUpdates.mockResolvedValue(updateAvailableStatus)

    render(<UpdateNotification onClose={onCloseMock} />)
    
    await waitFor(() => {
      expect(screen.getByText('後で')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('後で'))
    expect(onCloseMock).toHaveBeenCalled()
  })

  it('should retry checking for updates when retry button is clicked', async () => {
    const errorStatus: UpdateStatus = { 
      type: 'Error', 
      message: 'Network error' 
    }
    mockUpdaterApi.checkForUpdates.mockResolvedValue(errorStatus)

    render(<UpdateNotification />)
    
    await waitFor(() => {
      expect(screen.getByText('再試行')).toBeInTheDocument()
    })

    // Clear the initial call
    mockUpdaterApi.checkForUpdates.mockClear()

    fireEvent.click(screen.getByText('再試行'))

    await waitFor(() => {
      expect(mockUpdaterApi.checkForUpdates).toHaveBeenCalledTimes(1)
    })
  })

  it('should show date formatted in Japanese locale', async () => {
    const updateAvailableStatus: UpdateStatus = {
      type: 'UpdateAvailable',
      info: {
        version: '2.0.0',
        pub_date: '2024-12-25T00:00:00Z',
        url: 'https://example.com/update'
      }
    }
    mockUpdaterApi.checkForUpdates.mockResolvedValue(updateAvailableStatus)

    render(<UpdateNotification />)
    
    await waitFor(() => {
      expect(screen.getByText(/2024\/12\/25/)).toBeInTheDocument()
    })
  })
})
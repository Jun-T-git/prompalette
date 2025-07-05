import { useState, useEffect, useCallback } from 'react'

import { updaterApi } from '../../services/api'
import type { BackupInfo, BackupResult } from '../../types'
import { logger } from '../../utils'
import { Button } from '../common/Button'
import { ConfirmModal } from '../common/ConfirmModal'
import { Input } from '../common/Input'
import { Toast } from '../common/Toast'

export function BackupManager() {
  const [backups, setBackups] = useState<BackupInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [customBackupName, setCustomBackupName] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<{ filename: string; isVisible: boolean }>({
    filename: '',
    isVisible: false
  })
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info')

  const showToastMessage = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
  }, [])

  const loadBackups = useCallback(async () => {
    setIsLoading(true)
    try {
      const backupList = await updaterApi.listBackups()
      setBackups(backupList)
    } catch (error) {
      logger.error('Failed to load backups:', error)
      const errorMessage = error instanceof Error ? error.message : '不明なエラー'
      showToastMessage(`バックアップ一覧の取得に失敗しました: ${errorMessage}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }, [showToastMessage])

  const createManualBackup = useCallback(async () => {
    setIsCreatingBackup(true)
    try {
      const result: BackupResult = await updaterApi.createManualBackup(
        customBackupName.trim() || undefined
      )
      
      if (result.success) {
        showToastMessage('バックアップを作成しました', 'success')
        setCustomBackupName('')
        await loadBackups()
      } else {
        showToastMessage(result.error || 'バックアップの作成に失敗しました', 'error')
      }
    } catch (error) {
      logger.error('Failed to create backup:', error)
      const errorMessage = error instanceof Error ? error.message : '不明なエラー'
      showToastMessage(`バックアップの作成に失敗しました: ${errorMessage}`, 'error')
    } finally {
      setIsCreatingBackup(false)
    }
  }, [customBackupName, loadBackups, showToastMessage])

  const deleteBackup = useCallback(async (filename: string) => {
    try {
      const success = await updaterApi.deleteBackup(filename)
      if (success) {
        showToastMessage('バックアップを削除しました', 'success')
        await loadBackups()
      } else {
        showToastMessage('バックアップの削除に失敗しました', 'error')
      }
    } catch (error) {
      logger.error('Failed to delete backup:', error)
      const errorMessage = error instanceof Error ? error.message : '不明なエラー'
      showToastMessage(`バックアップの削除に失敗しました: ${errorMessage}`, 'error')
    }
  }, [loadBackups, showToastMessage])

  const restoreBackup = useCallback(async (backupPath: string, filename: string) => {
    try {
      const success = await updaterApi.restoreFromBackup(backupPath)
      if (success) {
        showToastMessage(`${filename} から復元しました。アプリを再起動してください。`, 'success')
      } else {
        showToastMessage('復元に失敗しました', 'error')
      }
    } catch (error) {
      logger.error('Failed to restore backup:', error)
      const errorMessage = error instanceof Error ? error.message : '不明なエラー'
      showToastMessage(`復元に失敗しました: ${errorMessage}`, 'error')
    }
  }, [showToastMessage])

  const cleanupOldBackups = useCallback(async () => {
    try {
      const deletedCount = await updaterApi.cleanupOldBackups(10)
      if (deletedCount > 0) {
        showToastMessage(`${deletedCount}個の古いバックアップを削除しました`, 'success')
        await loadBackups()
      } else {
        showToastMessage('削除対象のバックアップはありませんでした', 'info')
      }
    } catch (error) {
      logger.error('Failed to cleanup backups:', error)
      const errorMessage = error instanceof Error ? error.message : '不明なエラー'
      showToastMessage(`バックアップのクリーンアップに失敗しました: ${errorMessage}`, 'error')
    }
  }, [loadBackups, showToastMessage])

  useEffect(() => {
    loadBackups()
  }, [loadBackups])

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">データバックアップ管理</h2>
        
        {/* 手動バックアップ作成 */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-md font-medium text-gray-800 mb-3">新しいバックアップを作成</h3>
          <div className="flex space-x-3">
            <Input
              value={customBackupName}
              onChange={(e) => setCustomBackupName(e.target.value)}
              placeholder="バックアップ名（任意）"
              className="flex-1"
            />
            <Button
              onClick={createManualBackup}
              disabled={isCreatingBackup}
              className="flex items-center"
            >
              {isCreatingBackup ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  作成中...
                </>
              ) : (
                'バックアップ作成'
              )}
            </Button>
          </div>
        </div>

        {/* バックアップ管理ボタン */}
        <div className="mb-6 flex space-x-3">
          <Button variant="secondary" onClick={loadBackups} disabled={isLoading}>
            {isLoading ? '読み込み中...' : '一覧を更新'}
          </Button>
          <Button variant="secondary" onClick={cleanupOldBackups}>
            古いバックアップを削除
          </Button>
        </div>

        {/* バックアップ一覧 */}
        <div>
          <h3 className="text-md font-medium text-gray-800 mb-3">
            バックアップ一覧 ({backups.length}件)
          </h3>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : backups.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              バックアップが見つかりませんでした
            </div>
          ) : (
            <div className="space-y-3">
              {backups.map((backup) => (
                <div
                  key={backup.filename}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{backup.filename}</h4>
                        {backup.is_automatic ? (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            自動
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                            手動
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-gray-600 space-y-1">
                        <div>作成日時: {formatDate(backup.created_at)}</div>
                        <div>サイズ: {formatFileSize(backup.size_bytes)}</div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => restoreBackup(backup.full_path, backup.filename)}
                      >
                        復元
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setDeleteConfirm({
                          filename: backup.filename,
                          isVisible: true
                        })}
                        className="text-red-600 hover:text-red-700"
                      >
                        削除
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 削除確認モーダル */}
      <ConfirmModal
        isOpen={deleteConfirm.isVisible}
        title="バックアップの削除"
        message={`「${deleteConfirm.filename}」を削除しますか？この操作は取り消せません。`}
        confirmText="削除"
        cancelText="キャンセル"
        onConfirm={() => {
          deleteBackup(deleteConfirm.filename)
          setDeleteConfirm({ filename: '', isVisible: false })
        }}
        onCancel={() => setDeleteConfirm({ filename: '', isVisible: false })}
        confirmVariant="danger"
      />

      {/* トースト通知 */}
      {showToast && (
        <Toast
          message={toastMessage}
          variant={toastType}
          isVisible={true}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  )
}
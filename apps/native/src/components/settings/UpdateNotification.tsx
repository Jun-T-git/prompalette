import { useState, useEffect, useCallback } from 'react'

import { updaterApi } from '../../services/api'
import type { UpdateStatus, BackupResult } from '../../types'
import { Button } from '../common/Button'
import { Toast } from '../common/Toast'

interface UpdateNotificationProps {
  onClose?: () => void
}

export function UpdateNotification({ onClose }: UpdateNotificationProps) {
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info')

  const showToastMessage = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
  }, [])

  const checkForUpdates = useCallback(async () => {
    setIsChecking(true)
    try {
      const status = await updaterApi.checkForUpdates()
      setUpdateStatus(status)
      
      if (status.type === 'NoUpdateAvailable') {
        showToastMessage('お使いのアプリは最新バージョンです', 'success')
      } else if (status.type === 'Error') {
        showToastMessage(`アップデートチェックに失敗しました: ${status.message}`, 'error')
      }
    } catch (error) {
      console.error('Failed to check for updates:', error)
      showToastMessage('アップデートチェックに失敗しました', 'error')
    } finally {
      setIsChecking(false)
    }
  }, [showToastMessage])

  const handleUpdate = useCallback(async () => {
    if (!updateStatus || updateStatus.type !== 'UpdateAvailable') return

    setIsUpdating(true)
    showToastMessage('データのバックアップを作成中...', 'info')

    try {
      // 事前バックアップ
      const backupResult: BackupResult = await updaterApi.createBackup()
      if (!backupResult.success) {
        throw new Error(backupResult.error || 'バックアップの作成に失敗しました')
      }

      showToastMessage('アップデートをダウンロード中...', 'info')
      
      // アップデートの実行
      const result = await updaterApi.downloadAndApplyUpdate()
      
      if (result.type === 'Error') {
        throw new Error(result.message)
      }

      showToastMessage('アップデートが正常に開始されました。アプリが再起動されます。', 'success')
      
      // アプリが再起動するまで少し待つ
      setTimeout(() => {
        if (onClose) onClose()
      }, 3000)

    } catch (error) {
      console.error('Update failed:', error)
      showToastMessage(
        error instanceof Error ? error.message : 'アップデートに失敗しました',
        'error'
      )
    } finally {
      setIsUpdating(false)
    }
  }, [updateStatus, onClose, showToastMessage])

  // イベントリスナーでダウンロード進行状況を監視
  useEffect(() => {
    if (typeof window === 'undefined' || !('__TAURI_INTERNALS__' in window)) {
      return
    }

    const setupEventListeners = async () => {
      try {
        const { listen } = await import('@tauri-apps/api/event')
        
        const unsubscribeProgress = await listen<UpdateStatus>('update-download-progress', (event) => {
          if (event.payload.type === 'Downloading') {
            setDownloadProgress(event.payload.progress)
          }
        })

        const unsubscribeComplete = await listen<UpdateStatus>('update-download-complete', () => {
          setDownloadProgress(100)
          showToastMessage('ダウンロード完了。インストール中...', 'info')
        })

        const unsubscribeInstall = await listen<UpdateStatus>('update-install-start', () => {
          showToastMessage('アップデートをインストール中...', 'info')
        })

        return () => {
          unsubscribeProgress()
          unsubscribeComplete()
          unsubscribeInstall()
        }
      } catch (error) {
        console.error('Failed to setup update event listeners:', error)
        return undefined
      }
    }

    const cleanup = setupEventListeners()

    return () => {
      cleanup.then(fn => fn && fn())
    }
  }, [showToastMessage])

  // コンポーネントマウント時に自動チェック
  useEffect(() => {
    checkForUpdates()
  }, [checkForUpdates])

  const formatReleaseNotes = (notes?: string) => {
    if (!notes) return ''
    
    // Markdown形式のリリースノートを簡単にフォーマット
    return notes
      .replace(/^### /gm, '')
      .replace(/^- /gm, '• ')
      .split('\n')
      .slice(0, 10) // 最初の10行のみ表示
      .join('\n')
  }

  if (!updateStatus || updateStatus.type === 'NoUpdateAvailable') {
    return null
  }

  if (updateStatus.type === 'Error') {
    return (
      <>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  アップデートエラー
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  {updateStatus.message}
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={checkForUpdates}
              disabled={isChecking}
            >
              再試行
            </Button>
          </div>
        </div>
        {showToast && (
          <Toast
            message={toastMessage}
            variant={toastType}
            isVisible={true}
            onClose={() => setShowToast(false)}
          />
        )}
      </>
    )
  }

  if (updateStatus.type === 'UpdateAvailable') {
    return (
      <>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-blue-800">
                新しいバージョンが利用可能です
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  <strong>バージョン {updateStatus.info.version}</strong>
                  {updateStatus.info.pub_date && (
                    <span className="text-gray-600 ml-2">
                      ({new Date(updateStatus.info.pub_date).toLocaleDateString('ja-JP')})
                    </span>
                  )}
                </p>
                
                {updateStatus.info.notes && (
                  <div className="mt-3 bg-white rounded border p-3">
                    <h4 className="font-medium text-gray-800 mb-2">リリースノート:</h4>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                      {formatReleaseNotes(updateStatus.info.notes)}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex space-x-3">
                <Button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="inline-flex items-center"
                >
                  {isUpdating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      アップデート中...
                    </>
                  ) : (
                    'アップデートする'
                  )}
                </Button>
                
                <Button
                  variant="secondary"
                  onClick={checkForUpdates}
                  disabled={isChecking || isUpdating}
                >
                  再チェック
                </Button>
                
                {onClose && (
                  <Button
                    variant="secondary"
                    onClick={onClose}
                    disabled={isUpdating}
                  >
                    後で
                  </Button>
                )}
              </div>

              {isUpdating && downloadProgress > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>ダウンロード進行状況</span>
                    <span>{Math.round(downloadProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${downloadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {showToast && (
          <Toast
            message={toastMessage}
            variant={toastType}
            isVisible={true}
            onClose={() => setShowToast(false)}
          />
        )}
      </>
    )
  }

  return null
}
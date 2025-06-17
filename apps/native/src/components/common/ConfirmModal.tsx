import { useEffect } from 'react'

import { Button } from './Button'

interface ConfirmModalProps {
  /** モーダルの表示状態 */
  isOpen: boolean
  /** タイトル */
  title: string
  /** メッセージ */
  message: string
  /** 確認ボタンのテキスト */
  confirmText?: string
  /** キャンセルボタンのテキスト */
  cancelText?: string
  /** 確認ボタンのバリアント */
  confirmVariant?: 'primary' | 'danger'
  /** 確認時のコールバック */
  onConfirm: () => void
  /** キャンセル時のコールバック */
  onCancel: () => void
}

/**
 * 確認モーダルコンポーネント
 * ブラウザのconfirm()の代替として使用
 */
export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = '確認',
  cancelText = 'キャンセル',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  // ESCキーでキャンセル
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* オーバーレイ */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={onCancel}
      />
      
      {/* モーダル本体 */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="mt-2 text-sm text-gray-600">{message}</p>
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onCancel}
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant === 'danger' ? 'outline' : 'primary'}
            className={confirmVariant === 'danger' ? 'text-red-600 border-red-300 hover:bg-red-50' : ''}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}
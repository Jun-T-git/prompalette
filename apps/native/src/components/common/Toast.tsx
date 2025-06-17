import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'

/**
 * トーストの種類
 */
export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

/**
 * トーストの設定
 */
export interface ToastConfig {
  message: string
  variant: ToastVariant
  duration?: number
  autoClose?: boolean
}

/**
 * トーストの内部状態
 */
interface ToastState extends ToastConfig {
  id: string
  isVisible: boolean
}

/**
 * トーストコンテキストの値
 */
interface ToastContextValue {
  showToast: (message: string, variant: ToastVariant, options?: Partial<ToastConfig>) => void
  hideToast: (id: string) => void
  toasts: ToastState[]
}

const ToastContext = createContext<ToastContextValue | null>(null)

/**
 * トーストコンテキストのフック
 * @returns トーストコンテキストの値
 * @throws ToastProviderが見つからない場合
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

/**
 * トーストプロバイダーのプロパティ
 */
interface ToastProviderProps {
  children: ReactNode
  maxToasts?: number
}

/**
 * トーストプロバイダーコンポーネント
 * アプリケーション全体でトースト機能を提供
 * 
 * @param props - プロバイダーのプロパティ
 * @returns トーストプロバイダーJSX
 */
export function ToastProvider({ children, maxToasts = 5 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastState[]>([])

  /**
   * トーストを表示
   */
  const showToast = useCallback((
    message: string, 
    variant: ToastVariant, 
    options: Partial<ToastConfig> = {}
  ) => {
    const id = Math.random().toString(36).substring(2, 11)
    const newToast: ToastState = {
      id,
      message,
      variant,
      duration: options.duration ?? 3000,
      autoClose: options.autoClose ?? true,
      isVisible: true,
    }

    setToasts(prev => {
      // 最大数を超えた場合は古いトーストを削除
      const updatedToasts = prev.length >= maxToasts 
        ? prev.slice(1) 
        : prev
      return [...updatedToasts, newToast]
    })
  }, [maxToasts])

  /**
   * トーストを非表示
   */
  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const contextValue: ToastContextValue = {
    showToast,
    hideToast,
    toasts,
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onClose={hideToast} />
    </ToastContext.Provider>
  )
}

/**
 * トーストコンテナーのプロパティ
 */
interface ToastContainerProps {
  toasts: ToastState[]
  onClose: (id: string) => void
}

/**
 * トーストコンテナーコンポーネント
 * 複数のトーストを管理・表示
 */
function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          variant={toast.variant}
          isVisible={toast.isVisible}
          autoClose={toast.autoClose ?? true}
          duration={toast.duration ?? 3000}
          onClose={() => onClose(toast.id)}
        />
      ))}
    </div>
  )
}

/**
 * 個別トーストのプロパティ
 */
interface ToastProps {
  message: string
  variant: ToastVariant
  isVisible: boolean
  autoClose?: boolean
  duration?: number
  onClose: () => void
}

/**
 * 個別トーストコンポーネント
 * 
 * @param props - トーストのプロパティ
 * @returns トーストJSX
 */
export function Toast({ 
  message, 
  variant, 
  isVisible, 
  autoClose = true, 
  duration = 3000, 
  onClose 
}: ToastProps) {
  // 自動閉じる機能
  useEffect(() => {
    if (autoClose && isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [autoClose, isVisible, duration, onClose])

  if (!isVisible) return null

  // バリアント別のスタイル
  const variantStyles: Record<ToastVariant, string> = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  }

  // バリアント別のアイコン
  const variantIcons: Record<ToastVariant, string> = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  }

  return (
    <div
      role="alert"
      className={`
        relative flex items-center p-4 border rounded-lg shadow-lg
        animate-in slide-in-from-right-full duration-300
        ${variantStyles[variant]}
      `}
    >
      <div className="flex items-center space-x-3 flex-1">
        <span className="text-lg" role="img" aria-label={variant}>
          {variantIcons[variant]}
        </span>
        <span className="text-sm font-medium">{message}</span>
      </div>
      
      <button
        onClick={onClose}
        className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded"
        aria-label="Close notification"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
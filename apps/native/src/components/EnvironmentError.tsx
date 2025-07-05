import { useEffect, useState } from 'react'

import { getEnvironmentInfo } from '../utils'

/**
 * 環境エラー表示コンポーネント
 * Tauri環境でない場合に適切な指示を表示
 */
interface EnvironmentErrorProps {
  /** エラーメッセージ */
  error: string
  /** 再試行コールバック関数 */
  onRetry?: () => void
}

/**
 * 環境エラー表示コンポーネント
 * 
 * @param props - プロパティ
 * @returns 環境エラー表示JSX
 */
export function EnvironmentError({ error, onRetry }: EnvironmentErrorProps) {
  const [isTauri, setIsTauri] = useState(false)
  
  useEffect(() => {
    getEnvironmentInfo().then(envInfo => {
      setIsTauri(envInfo.isDevelopment || envInfo.isStaging || envInfo.isProduction)
    }).catch(() => {
      setIsTauri(false)
    })
  }, [])
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">
              環境エラー
            </h3>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-3">
            {error}
          </p>
          
          {!isTauri && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">
                    正しい起動方法
                  </h4>
                  <div className="mt-2 text-sm text-blue-700">
                    <p className="mb-2">
                      PromPalette Native Appを正しく起動するには：
                    </p>
                    <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono">
                      <p># 開発環境で起動</p>
                      <p>pnpm dev</p>
                      <p></p>
                      <p># ステージング環境で起動</p>
                      <p>pnpm dev:staging</p>
                      <p></p>
                      <p># またはWebのみでテストする場合</p>
                      <p>pnpm dev:web</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex space-x-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              再試行
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            リロード
          </button>
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          <p>環境情報:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Tauri環境: {isTauri ? 'はい' : 'いいえ'}</li>
            <li>Node環境: {process.env.NODE_ENV || 'unknown'}</li>
            <li>ユーザーエージェント: {typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 50) + '...' : 'unknown'}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
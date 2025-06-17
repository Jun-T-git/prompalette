import React from 'react'

/**
 * ButtonコンポーネントのProps
 * 標準のHTMLButton要素の属性を継承し、追加のカスタマイズオプションを提供
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** ボタンの視覚スタイルバリエーション */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  
  /** ボタンのサイズ */
  size?: 'sm' | 'md' | 'lg'
  
  /** ローディング状態（trueの場合はスピナー表示） */
  isLoading?: boolean
  
  /** ボタン内に表示するコンテンツ */
  children: React.ReactNode
}

/**
 * 再利用可能なButtonコンポーネント
 * Tailwind CSSを使用した統一デザインとアクセシビリティ対応
 * 
 * @param variant - ボタンの視覚スタイル
 * @param size - ボタンのサイズ
 * @param isLoading - ローディング状態
 * @param children - ボタン内のコンテンツ
 * @param props - その他のHTML button属性
 * 
 * @example
 * ```tsx
 * // 基本使用
 * <Button onClick={handleClick}>クリック</Button>
 * 
 * // ローディング状態
 * <Button isLoading={true}>送信中...</Button>
 * 
 * // スタイルバリエーション
 * <Button variant="outline" size="sm">キャンセル</Button>
 * ```
 */
export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  // 基本スタイル（アクセシビリティ、アニメーションなど）
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
  
  // バリエーション別のスタイル定義
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500', // メインアクション用
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500', // サブアクション用
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500', // 枠線スタイル
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-blue-500', // ミニマルスタイル
  }
  
  // サイズ別のスタイル定義
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',   // 小サイズ
    md: 'px-4 py-2 text-base', // 標準サイズ
    lg: 'px-6 py-3 text-lg',   // 大サイズ
  }

  // 最終的なCSSクラスを組み立て
  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className, // カスタムスタイルの上書き用
  ].join(' ')

  return (
    <button
      className={classes}
      disabled={disabled || isLoading} // ローディング中は無効化
      {...props}
    >
      {isLoading ? (
        // ローディング状態の表示（スピナー + テキスト）
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          読み込み中...
        </>
      ) : (
        // 通常状態の表示
        children
      )}
    </button>
  )
}
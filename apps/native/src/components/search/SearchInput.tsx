import { useState, useEffect } from 'react'

import { Input } from '../common'

/**
 * 検索入力コンポーネントのProps
 * デバウンス機能と検索アイコン、クリアボタン付きの特化入力フィールド
 */
interface SearchInputProps {
  /** 現在の検索値（制御されたコンポーネントとして使用） */
  value: string
  
  /** 値が変更されたときのコールバック（デバウンス後） */
  onChange: (value: string) => void
  
  /** 検索実行時のコールバック（任意、onChangeと同時に呼び出される） */
  onSearch?: (value: string) => void
  
  /** プレースホルダーテキスト */
  placeholder?: string
  
  /** デバウンスの遅延時間（ミリ秒、デフォルト: 300ms） */
  debounceMs?: number
}

/**
 * デバウンス機能付き検索入力コンポーネント
 * 検索アイコン、クリアボタン、リアルタイムフィルタリングを提供
 * 
 * @param value - 外部から制御される現在の検索値
 * @param onChange - デバウンス後に呼び出される変更ハンドラー
 * @param onSearch - 検索実行時の追加ハンドラー（任意）
 * @param placeholder - プレースホルダーテキスト
 * @param debounceMs - デバウンス遅延時間
 * 
 * @example
 * ```tsx
 * const [query, setQuery] = useState('')
 * 
 * <SearchInput 
 *   value={query}
 *   onChange={setQuery}
 *   onSearch={(term) => console.log('検索:', term)}
 *   placeholder="プロンプトを検索..."
 * />
 * ```
 */
export function SearchInput({
  value,
  onChange,
  onSearch,
  placeholder = 'プロンプトを検索...',
  debounceMs = 300,
}: SearchInputProps) {
  // ローカル入力状態（デバウンス用）
  const [localValue, setLocalValue] = useState(value)

  // デバウンス処理：ユーザーの入力が停止してから一定時間後にコールバック実行
  useEffect(() => {
    const timer = setTimeout(() => {
      // ローカル値と外部値が異なる場合のみコールバック実行
      if (localValue !== value) {
        onChange(localValue)
        onSearch?.(localValue)
      }
    }, debounceMs)

    // クリーンアップ：新しい入力があった場合は前のタイマーをキャンセル
    return () => clearTimeout(timer)
  }, [localValue, debounceMs, onChange, onSearch, value])

  // 外部からの値変更との同期（例：リセット時など）
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  /**
   * クリアボタンのクリックハンドラー
   * ローカル値と外部値を両方とも空にし、即座にコールバック実行
   */
  const handleClear = () => {
    setLocalValue('')
    onChange('')
    onSearch?.('')
  }

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          className="h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      
      <Input
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10"
      />

      {localValue && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          title="クリア"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  )
}
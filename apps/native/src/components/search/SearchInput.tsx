import { useState, useEffect, forwardRef } from 'react'

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
  
  /** フォーカス時のコールバック */
  onFocus?: () => void
  
  /** フォーカスが外れた時のコールバック */
  onBlur?: () => void
  
  /** キーボードイベントのコールバック */
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  
  /** IME変換開始のコールバック */
  onCompositionStart?: () => void
  
  /** IME変換終了のコールバック */
  onCompositionEnd?: () => void
  
  /** プロンプト選択確定のコールバック（変換確定後のEnter用） */
  onPromptSelect?: () => void
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
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput({
  value,
  onChange,
  onSearch,
  placeholder = 'プロンプトを検索...',
  debounceMs = 300,
  onFocus,
  onBlur,
  onKeyDown,
  onCompositionStart,
  onCompositionEnd,
  onPromptSelect,
}, ref) {
  // ローカル入力状態（デバウンス用）
  const [localValue, setLocalValue] = useState(value)
  // IME変換中かどうかを追跡
  const [isComposing, setIsComposing] = useState(false)
  // compositionEnd直後の短時間フラグ
  const [justEndedComposition, setJustEndedComposition] = useState(false)

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

  /**
   * 検索フィールド専用のキーボードハンドラー
   * IME状態に基づいてEnter処理を適切に分岐
   */
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 検索フィールド内でのEnter処理
    if (e.key === 'Enter') {
      // より確実なIME検出: 複数の方法を組み合わせて判定
      // 1. isComposingフラグ
      // 2. keyCodeが229（IME処理中）
      // 3. compositionEnd直後の短時間
      const isIMEActive = isComposing || e.keyCode === 229 || e.which === 229 || justEndedComposition
      
      if (isIMEActive) {
        e.stopPropagation() // 親のイベントハンドラーに伝播させない
        return
      }
      
      // 変換確定後のEnter: プロンプト選択実行
      e.preventDefault()
      e.stopPropagation()
      onPromptSelect?.()
      return
    }

    // ArrowUp/ArrowDownは親に委譲（プロンプト選択のため）
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      // プロパゲーションを許可して親のハンドラーに処理を委譲
      onKeyDown?.(e)
      return
    }

    // その他のキーも親に委譲
    onKeyDown?.(e)
  }

  /**
   * IME変換開始ハンドラー
   */
  const handleCompositionStart = () => {
    setIsComposing(true)
    onCompositionStart?.()
  }

  /**
   * IME変換終了ハンドラー
   */
  const handleCompositionEnd = () => {
    setIsComposing(false)
    setJustEndedComposition(true)
    
    // 短時間後にフラグをクリア
    setTimeout(() => {
      setJustEndedComposition(false)
    }, 100)
    
    onCompositionEnd?.()
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
        ref={ref}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10"
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={handleSearchKeyDown}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
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
})
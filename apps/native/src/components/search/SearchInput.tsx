import { useState, useEffect, forwardRef, useRef } from 'react'

import { useSearchSuggestions, useInlineCompletion, type SearchSuggestion } from '../../hooks'
import type { Prompt } from '../../types'
import { Input } from '../common'

import { SearchSuggestions } from './SearchSuggestions'

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
  
  
  /** 検索候補機能を有効にするかどうか */
  enableSuggestions?: boolean
  
  /** 検索候補生成用のプロンプト一覧 */
  prompts?: Prompt[]
  
  /** 候補のデバウンス時間（ミリ秒、デフォルト: 150ms） */
  suggestionsDebounceMs?: number
  
  /** インライン補完機能を有効にするかどうか */
  enableInlineCompletion?: boolean
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
  enableSuggestions = true,
  prompts = [],
  suggestionsDebounceMs = 150,
  enableInlineCompletion = true,
}, ref) {
  // ローカル入力状態（デバウンス用）
  const [localValue, setLocalValue] = useState(value)
  // 候補表示用のローカル値（より短いデバウンス）
  const [suggestionsValue, setSuggestionsValue] = useState(value)
  // IME変換中かどうかを追跡
  const [isComposing, setIsComposing] = useState(false)
  // compositionEnd直後の短時間フラグ
  const [justEndedComposition, setJustEndedComposition] = useState(false)
  // 検索候補の表示状態
  const [showSuggestions, setShowSuggestions] = useState(false)
  // 候補ナビゲーション用のインデックス
  const [suggestionIndex, setSuggestionIndex] = useState(-1)
  // アクティブなドロップダウン（候補）
  const [activeDropdown, setActiveDropdown] = useState<'suggestions' | null>(null)
  // 検索候補フック
  const { suggestions, isVisible: suggestionsVisible } = useSearchSuggestions(
    prompts,
    enableSuggestions ? suggestionsValue : '',
    {
      disabled: !enableSuggestions,
      includeHistory: false,
    }
  )
  // 候補ドロップダウンの参照
  const suggestionsRef = useRef<HTMLDivElement>(null)
  // インライン補完フック
  const inlineCompletion = useInlineCompletion(
    prompts,
    localValue,
    { disabled: !enableInlineCompletion }
  )

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

  // 候補表示用のデバウンス処理（より短いデバウンス）
  useEffect(() => {
    const timer = setTimeout(() => {
      setSuggestionsValue(localValue)
    }, suggestionsDebounceMs)

    return () => clearTimeout(timer)
  }, [localValue, suggestionsDebounceMs])

  // 外部からの値変更との同期（例：リセット時など）
  useEffect(() => {
    setLocalValue(value)
    setSuggestionsValue(value)
  }, [value])

  // 候補表示状態の管理
  useEffect(() => {
    if (enableSuggestions && suggestionsVisible && localValue.trim()) {
      setShowSuggestions(true)
      setActiveDropdown('suggestions')
    } else {
      setShowSuggestions(false)
      setActiveDropdown(null)
    }
  }, [enableSuggestions, suggestionsVisible, localValue, activeDropdown])

  /**
   * クリアボタンのクリックハンドラー
   * ローカル値と外部値を両方とも空にし、即座にコールバック実行
   */
  const handleClear = () => {
    setLocalValue('')
    setSuggestionsValue('')
    onChange('')
    onSearch?.('')
    setShowSuggestions(false)
    setSuggestionIndex(-1)
    setActiveDropdown(null)
  }

  /**
   * 検索フィールド専用のキーボードハンドラー
   * IME状態に基づいてEnter処理を適切に分岐
   * 候補のキーボードナビゲーションに対応
   */
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // タブキーでインライン補完を確定
    if (e.key === 'Tab' && inlineCompletion.completion) {
      e.preventDefault()
      setLocalValue(inlineCompletion.fullText)
      setSuggestionsValue(inlineCompletion.fullText)
      onChange(inlineCompletion.fullText)
      onSearch?.(inlineCompletion.fullText)
      return
    }

    // 候補ドロップダウンが表示されている場合のキーボード処理
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        return
      }
      
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        return
      }
      
      if (e.key === 'Enter' && suggestionIndex >= 0 && suggestionIndex < suggestions.length) {
        e.preventDefault()
        e.stopPropagation()
        const selectedSuggestion = suggestions[suggestionIndex]
        if (selectedSuggestion) {
          setLocalValue(selectedSuggestion.value)
          setSuggestionsValue(selectedSuggestion.value)
          onChange(selectedSuggestion.value)
          onSearch?.(selectedSuggestion.value)
        }
        setShowSuggestions(false)
        setSuggestionIndex(-1)
        setActiveDropdown(null)
        return
      }
      
      if (e.key === 'Escape') {
        // Only prevent default if suggestions are visible
        if (showSuggestions) {
          e.preventDefault()
          setShowSuggestions(false)
          setSuggestionIndex(-1)
          setActiveDropdown(null)
          return
        }
        // If no suggestions visible, let the event propagate to global handler
        // This allows the global Escape handler to clear search or hide window
      }
    }

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
      onPromptSelect?.()
      // Note: Don't call e.preventDefault() or e.stopPropagation() here
      // to allow the global keyboard handler to process the "confirm" action
      return
    }

    // ArrowUp/ArrowDownはドロップダウンが表示されていない場合のみ親に委譲
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      if (!showSuggestions) {
        onKeyDown?.(e)
      }
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

  /**
   * フォーカス時のハンドラー
   */
  const handleFocus = () => {
    onFocus?.()
  }

  /**
   * フォーカス外れ時のハンドラー
   */
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // 候補ドロップダウン内の要素にフォーカスが移動した場合は閉じない
    if (suggestionsRef.current && suggestionsRef.current.contains(e.relatedTarget as Node)) {
      return
    }
    
    // 少し遅延を入れてドロップダウンを閉じる
    setTimeout(() => {
      setShowSuggestions(false)
      setSuggestionIndex(-1)
      setActiveDropdown(null)
    }, 150)
    
    onBlur?.()
  }


  /**
   * 候補アイテム選択ハンドラー
   */
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setLocalValue(suggestion.value)
    setSuggestionsValue(suggestion.value)
    onChange(suggestion.value)
    onSearch?.(suggestion.value)
    setShowSuggestions(false)
    setSuggestionIndex(-1)
    setActiveDropdown(null)
  }

  /**
   * 候補ドロップダウンのEscapeハンドラー
   */
  const handleSuggestionEscape = () => {
    setShowSuggestions(false)
    setSuggestionIndex(-1)
    setActiveDropdown(null)
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
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleSearchKeyDown}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
      />

      {/* インライン補完のオーバーレイ */}
      {enableInlineCompletion && inlineCompletion.completion && (
        <div className="absolute inset-0 flex items-center pointer-events-none pl-10 pr-10">
          <div className="text-gray-400 whitespace-nowrap overflow-hidden">
            {/* 現在の入力値の分だけスペースを確保 */}
            <span className="invisible">{localValue}</span>
            {/* 補完候補を薄く表示 */}
            <span className="text-gray-300">{inlineCompletion.completion}</span>
          </div>
        </div>
      )}

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
      
      {/* 検索候補ドロップダウン */}
      {enableSuggestions && (
        <SearchSuggestions
          ref={suggestionsRef}
          suggestions={suggestions}
          isVisible={showSuggestions}
          selectedIndex={suggestionIndex}
          onSelect={handleSuggestionSelect}
          onEscape={handleSuggestionEscape}
        />
      )}
    </div>
  )
})
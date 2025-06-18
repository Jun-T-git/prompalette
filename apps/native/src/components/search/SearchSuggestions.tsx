import { forwardRef, useCallback } from 'react'

import type { SearchSuggestion } from '../../hooks/useSearchSuggestions'

/**
 * 検索候補コンポーネントのProps
 */
interface SearchSuggestionsProps {
  /** 表示する候補一覧 */
  suggestions: SearchSuggestion[]
  /** 候補が表示されているかどうか */
  isVisible: boolean
  /** 現在選択されている候補のインデックス */
  selectedIndex: number
  /** 候補選択時のコールバック */
  onSelect: (suggestion: SearchSuggestion) => void
  /** Escapeキー押下時のコールバック */
  onEscape: () => void
  /** キーボードナビゲーション時のコールバック */
  onKeyDown?: (event: React.KeyboardEvent) => void
  /** カスタムCSSクラス */
  className?: string
}

/**
 * 検索候補の種類に応じたアイコンを返す
 */
function getSuggestionIcon(type: SearchSuggestion['type']): string {
  switch (type) {
    case 'tag':
      return '#'
    case 'quickAccess':
      return '/'
    case 'text':
      return '📝'
    default:
      return '💡'
  }
}

/**
 * 検索候補の種類に応じたスタイルクラスを返す
 */
function getSuggestionTypeClass(type: SearchSuggestion['type']): string {
  switch (type) {
    case 'tag':
      return 'text-blue-600 bg-blue-50'
    case 'quickAccess':
      return 'text-purple-600 bg-purple-50'
    case 'text':
      return 'text-green-600 bg-green-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

/**
 * テキスト内のマッチした部分をハイライトする
 */
function highlightMatch(text: string, matchRange?: { start: number; end: number }): React.ReactNode {
  if (!matchRange) {
    return text
  }

  const { start, end } = matchRange
  const before = text.slice(0, start)
  const match = text.slice(start, end)
  const after = text.slice(end)

  return (
    <>
      {before}
      <mark className="bg-yellow-200 text-yellow-900 px-0.5 rounded">{match}</mark>
      {after}
    </>
  )
}

/**
 * 検索候補表示コンポーネント
 * 
 * 機能:
 * - 検索候補の一覧表示
 * - キーボードナビゲーション対応
 * - 候補の種類別アイコン・スタイル
 * - マッチした文字列のハイライト
 * - アクセシビリティ対応
 * 
 * @param suggestions - 表示する候補一覧
 * @param isVisible - 候補が表示されているかどうか
 * @param selectedIndex - 現在選択されている候補のインデックス
 * @param onSelect - 候補選択時のコールバック
 * @param onEscape - Escapeキー押下時のコールバック
 * @param onKeyDown - キーボードナビゲーション時のコールバック
 * @param className - カスタムCSSクラス
 * 
 * @example
 * ```tsx
 * <SearchSuggestions
 *   suggestions={suggestions}
 *   isVisible={isVisible}
 *   selectedIndex={selectedIndex}
 *   onSelect={handleSelect}
 *   onEscape={handleEscape}
 * />
 * ```
 */
export const SearchSuggestions = forwardRef<HTMLDivElement, SearchSuggestionsProps>(
  function SearchSuggestions({
    suggestions,
    isVisible,
    selectedIndex,
    onSelect,
    onEscape,
    onKeyDown,
    className = '',
  }, ref) {
    
    /**
     * キーボードイベントハンドラー
     */
    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onEscape()
        return
      }
      
      // 他のキーは親に委譲
      onKeyDown?.(event)
    }, [onEscape, onKeyDown])

    /**
     * 候補アイテムクリックハンドラー
     */
    const handleItemClick = useCallback((suggestion: SearchSuggestion) => {
      onSelect(suggestion)
    }, [onSelect])

    /**
     * 候補アイテムのマウスダウンハンドラー
     * フォーカスが外れるのを防ぐ
     */
    const handleItemMouseDown = useCallback((event: React.MouseEvent) => {
      event.preventDefault()
    }, [])

    // 非表示または候補がない場合は何も表示しない
    if (!isVisible || suggestions.length === 0) {
      return null
    }

    return (
      <div
        ref={ref}
        className={`absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto ${className}`}
        onKeyDown={handleKeyDown}
        role="listbox"
        aria-label="検索候補"
      >
        {suggestions.map((suggestion, index) => (
          <div
            key={suggestion.id}
            className={`
              flex items-center px-3 py-2 cursor-pointer transition-colors duration-150
              ${index === selectedIndex 
                ? 'bg-blue-100 text-blue-900' 
                : 'hover:bg-gray-50'
              }
              ${index === suggestions.length - 1 ? '' : 'border-b border-gray-100'}
            `}
            onClick={() => handleItemClick(suggestion)}
            onMouseDown={handleItemMouseDown}
            role="option"
            aria-selected={index === selectedIndex}
            data-testid={`suggestion-${suggestion.type}-${index}`}
          >
            {/* アイコン */}
            <div className={`
              flex-shrink-0 w-6 h-6 rounded text-xs font-semibold
              flex items-center justify-center mr-3
              ${getSuggestionTypeClass(suggestion.type)}
            `}>
              {getSuggestionIcon(suggestion.type)}
            </div>

            {/* メインコンテンツ */}
            <div className="flex-1 min-w-0">
              {/* 候補テキスト */}
              <div className="text-sm font-medium text-gray-900 truncate">
                {highlightMatch(suggestion.text, suggestion.matchRange)}
              </div>
              
              {/* 説明文 */}
              {suggestion.description && (
                <div className="text-xs text-gray-500 truncate mt-0.5">
                  {suggestion.description}
                </div>
              )}
            </div>

            {/* 選択中インジケーター */}
            {index === selectedIndex && (
              <div className="flex-shrink-0 ml-2">
                <svg 
                  className="w-4 h-4 text-blue-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}

        {/* フッター情報 */}
        <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
          {suggestions.length}件の候補 • ↑↓で選択 • Enterで決定 • Escで閉じる
        </div>
      </div>
    )
  }
)
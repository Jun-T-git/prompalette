import { useMemo } from 'react'

import type { Prompt } from '../types'


/**
 * 検索候補の種類
 */
export type SuggestionType = 'tag' | 'quickAccess' | 'text'

/**
 * 検索候補アイテム
 */
export interface SearchSuggestion {
  /** 候補のID（重複回避用） */
  id: string
  /** 候補の種類 */
  type: SuggestionType
  /** 表示用テキスト */
  text: string
  /** 補完用の値（実際にinputに入力される値） */
  value: string
  /** 候補の説明（任意） */
  description?: string
  /** マッチした文字列の範囲（ハイライト用） */
  matchRange?: { start: number; end: number }
}

/**
 * 検索候補生成のオプション
 */
export interface SearchSuggestionsOptions {
  /** 最大候補数 */
  maxSuggestions?: number
  /** 候補生成を無効にするかどうか */
  disabled?: boolean
  /** 履歴候補を含めるかどうか */
  includeHistory?: boolean
  /** タグ候補を含めるかどうか */
  includeTags?: boolean
  /** クイックアクセス候補を含めるかどうか */
  includeQuickAccess?: boolean
}

/**
 * 検索候補生成の結果
 */
export interface UseSearchSuggestionsResult {
  /** 生成された候補一覧 */
  suggestions: SearchSuggestion[]
  /** 候補が表示されているかどうか */
  isVisible: boolean
  /** 候補の数 */
  count: number
}

/**
 * 検索候補生成とオートコンプリート機能を提供するカスタムフック
 * 
 * 機能:
 * - 既存タグからの候補生成
 * - クイックアクセスキーからの候補生成
 * - 入力文字に基づくリアルタイム候補フィルタリング
 * - #や/の特別な構文に対応
 * 
 * @param prompts - プロンプト一覧
 * @param searchQuery - 現在の検索クエリ
 * @param options - 候補生成のオプション
 * @returns 検索候補の結果
 * 
 * @example
 * ```typescript
 * const { suggestions, isVisible } = useSearchSuggestions(
 *   prompts,
 *   searchQuery,
 *   { maxSuggestions: 10 }
 * )
 * ```
 */
export function useSearchSuggestions(
  prompts: Prompt[],
  searchQuery: string,
  options: SearchSuggestionsOptions = {}
): UseSearchSuggestionsResult {
  const {
    maxSuggestions = 10,
    disabled = false,
    includeHistory = true,
    includeTags = true,
    includeQuickAccess = true,
  } = options


  // プロンプトからタグとクイックアクセスキーを抽出
  const { tags, quickAccessKeys } = useMemo(() => {
    const tagSet = new Set<string>()
    const quickAccessSet = new Set<string>()

    prompts.forEach(prompt => {
      // タグを収集
      if (prompt.tags) {
        prompt.tags.forEach(tag => tagSet.add(tag))
      }
      
      // クイックアクセスキーを収集
      if (prompt.quickAccessKey) {
        quickAccessSet.add(prompt.quickAccessKey)
      }
    })

    return {
      tags: Array.from(tagSet).sort(),
      quickAccessKeys: Array.from(quickAccessSet).sort()
    }
  }, [prompts])

  // 検索候補を生成
  const suggestions = useMemo(() => {
    if (disabled || !searchQuery.trim()) {
      return []
    }

    const allSuggestions: SearchSuggestion[] = []

    // カーソル位置を考慮した入力解析
    const lastSpaceIndex = searchQuery.lastIndexOf(' ')
    const currentTerm = searchQuery.slice(lastSpaceIndex + 1)
    const beforeCursor = searchQuery.slice(0, lastSpaceIndex + 1)

    // 1. タグ候補 (#で始まる入力)
    if (includeTags && currentTerm.startsWith('#')) {
      const tagQuery = currentTerm.slice(1).toLowerCase()
      
      if (tagQuery.length > 0) {
        tags
          .filter(tag => tag.toLowerCase().includes(tagQuery))
          .slice(0, Math.ceil(maxSuggestions / 3))
          .forEach(tag => {
            const matchIndex = tag.toLowerCase().indexOf(tagQuery)
            allSuggestions.push({
              id: `tag-${tag}`,
              type: 'tag',
              text: `#${tag}`,
              value: beforeCursor + `#${tag} `,
              description: `タグ: ${tag}`,
              matchRange: matchIndex >= 0 ? {
                start: matchIndex + 1, // # の分を考慮
                end: matchIndex + tagQuery.length + 1
              } : undefined
            })
          })
      } else {
        // # だけが入力された場合は全タグを表示
        tags
          .slice(0, Math.ceil(maxSuggestions / 3))
          .forEach(tag => {
            allSuggestions.push({
              id: `tag-${tag}`,
              type: 'tag',
              text: `#${tag}`,
              value: beforeCursor + `#${tag} `,
              description: `タグ: ${tag}`
            })
          })
      }
    }

    // 2. クイックアクセス候補 (/で始まる入力)
    if (includeQuickAccess && currentTerm.startsWith('/')) {
      const keyQuery = currentTerm.slice(1).toLowerCase()
      
      if (keyQuery.length > 0) {
        quickAccessKeys
          .filter(key => key.toLowerCase().includes(keyQuery))
          .slice(0, Math.ceil(maxSuggestions / 3))
          .forEach(key => {
            const matchIndex = key.toLowerCase().indexOf(keyQuery)
            allSuggestions.push({
              id: `quickaccess-${key}`,
              type: 'quickAccess',
              text: `/${key}`,
              value: beforeCursor + `/${key} `,
              description: `クイックアクセス: ${key}`,
              matchRange: matchIndex >= 0 ? {
                start: matchIndex + 1, // / の分を考慮
                end: matchIndex + keyQuery.length + 1
              } : undefined
            })
          })
      } else {
        // / だけが入力された場合は全クイックアクセスキーを表示
        quickAccessKeys
          .slice(0, Math.ceil(maxSuggestions / 3))
          .forEach(key => {
            allSuggestions.push({
              id: `quickaccess-${key}`,
              type: 'quickAccess',
              text: `/${key}`,
              value: beforeCursor + `/${key} `,
              description: `クイックアクセス: ${key}`
            })
          })
      }
    }


    // 4. 一般的な検索候補（将来的に実装予定）
    // プロンプトのタイトルや内容から候補を生成する機能

    // 優先度順にソート
    const sortedSuggestions = allSuggestions.sort((a, b) => {
      const typePriority = {
        'quickAccess': 1,
        'tag': 2,
        'text': 3
      }
      
      const priorityDiff = typePriority[a.type] - typePriority[b.type]
      if (priorityDiff !== 0) {
        return priorityDiff
      }
      
      // 同じタイプの場合は、マッチした位置で優先度を決定
      if (a.matchRange && b.matchRange) {
        return a.matchRange.start - b.matchRange.start
      }
      
      // マッチ位置がない場合はアルファベット順
      return a.text.localeCompare(b.text)
    })

    return sortedSuggestions.slice(0, maxSuggestions)
  }, [
    disabled,
    searchQuery,
    tags,
    quickAccessKeys,
    maxSuggestions,
    includeTags,
    includeQuickAccess,
    includeHistory
  ])

  return {
    suggestions,
    isVisible: suggestions.length > 0,
    count: suggestions.length
  }
}
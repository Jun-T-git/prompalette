import { useMemo } from 'react'

import type { Prompt } from '../types'

/**
 * インライン補完の結果
 */
export interface InlineCompletion {
  /** 補完候補のテキスト */
  completion: string
  /** 補完を適用した後の完全なクエリ */
  fullText: string
  /** 補完の種類 */
  type: 'quickAccess' | 'tag' | null
}

/**
 * インライン補完のオプション
 */
export interface InlineCompletionOptions {
  /** 機能を無効にするかどうか */
  disabled?: boolean
}

/**
 * インライン補完機能を提供するカスタムフック
 * 
 * ターミナルやGitHub Copilotのような入力補完体験を提供
 * `/r` → `/react` のように候補を薄く表示し、タブで確定
 * 
 * @param prompts - プロンプト一覧
 * @param searchQuery - 現在の検索クエリ
 * @param options - 補完のオプション
 * @returns インライン補完の結果
 * 
 * @example
 * ```typescript
 * const { completion, fullText, type } = useInlineCompletion(
 *   prompts,
 *   '/r'
 * )
 * // completion: 'eact'
 * // fullText: '/react'
 * // type: 'quickAccess'
 * ```
 */
export function useInlineCompletion(
  prompts: Prompt[],
  searchQuery: string,
  options: InlineCompletionOptions = {}
): InlineCompletion {
  const { disabled = false } = options

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

  // インライン補完の計算
  const inlineCompletion = useMemo((): InlineCompletion => {
    if (disabled || !searchQuery.trim()) {
      return { completion: '', fullText: searchQuery, type: null }
    }

    // 最後のスペース以降の現在の入力項目を取得
    const lastSpaceIndex = searchQuery.lastIndexOf(' ')
    const beforeCursor = searchQuery.slice(0, lastSpaceIndex + 1)
    const currentTerm = searchQuery.slice(lastSpaceIndex + 1)

    // クイックアクセスキー補完 (/で始まる)
    if (currentTerm.startsWith('/')) {
      const prefix = currentTerm.slice(1) // / を除く
      
      // / だけの場合は最初の候補を表示
      if (prefix.length === 0 && quickAccessKeys.length > 0) {
        const firstKey = quickAccessKeys[0]
        if (firstKey) {
          const completion = firstKey
          const fullText = beforeCursor + currentTerm + completion
          return {
            completion,
            fullText,
            type: 'quickAccess'
          }
        }
      }
      
      // 前方一致する最初の候補を検索
      const match = quickAccessKeys.find(key => 
        key.toLowerCase().startsWith(prefix.toLowerCase()) &&
        key.toLowerCase() !== prefix.toLowerCase() // 完全一致は除外
      )

      if (match) {
        const completion = match.slice(prefix.length) // 残りの部分
        const fullText = beforeCursor + currentTerm + completion
        return {
          completion,
          fullText,
          type: 'quickAccess'
        }
      }
    }

    // タグ補完 (#で始まる)
    if (currentTerm.startsWith('#')) {
      const prefix = currentTerm.slice(1) // # を除く
      
      // # だけの場合は最初の候補を表示
      if (prefix.length === 0 && tags.length > 0) {
        const firstTag = tags[0]
        if (firstTag) {
          const completion = firstTag
          const fullText = beforeCursor + currentTerm + completion
          return {
            completion,
            fullText,
            type: 'tag'
          }
        }
      }
      
      // 前方一致する最初の候補を検索
      const match = tags.find(tag => 
        tag.toLowerCase().startsWith(prefix.toLowerCase()) &&
        tag.toLowerCase() !== prefix.toLowerCase() // 完全一致は除外
      )

      if (match) {
        const completion = match.slice(prefix.length) // 残りの部分
        const fullText = beforeCursor + currentTerm + completion
        return {
          completion,
          fullText,
          type: 'tag'
        }
      }
    }

    // 候補がない場合
    return { completion: '', fullText: searchQuery, type: null }
  }, [disabled, searchQuery, tags, quickAccessKeys])

  return inlineCompletion
}
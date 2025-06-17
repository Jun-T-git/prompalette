import { useMemo } from 'react'

import type { Prompt } from '../types'

/**
 * プロンプト検索カスタムフック
 * 検索クエリに基づいてプロンプトをフィルタリングし、パフォーマンスを最適化
 */
export function usePromptSearch(prompts: Prompt[], searchQuery: string) {
  return useMemo(() => {
    if (!searchQuery) return prompts
    
    const query = searchQuery.toLowerCase()
    return prompts.filter(prompt => 
      prompt.title.toLowerCase().includes(query) ||
      prompt.content.toLowerCase().includes(query) ||
      (Array.isArray(prompt.tags) && prompt.tags.some(tag => tag.toLowerCase().includes(query)))
    )
  }, [prompts, searchQuery])
}
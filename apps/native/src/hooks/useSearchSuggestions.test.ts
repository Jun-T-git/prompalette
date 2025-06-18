import { renderHook } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'

import type { Prompt } from '../types'

import { useSearchSuggestions } from './useSearchSuggestions'


describe('useSearchSuggestions', () => {
  const mockPrompts: Prompt[] = [
    {
      id: '1',
      title: 'React Component',
      content: 'Create a React component',
      tags: ['react', 'frontend', 'typescript'],
      quickAccessKey: 'rct',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    },
    {
      id: '2',
      title: 'Code Review',
      content: 'Review this code',
      tags: ['review', 'quality'],
      quickAccessKey: 'rvw',
      created_at: '2023-01-02T00:00:00Z',
      updated_at: '2023-01-02T00:00:00Z',
    },
    {
      id: '3',
      title: 'Database Migration',
      content: 'Create database migration',
      tags: ['database', 'backend'],
      quickAccessKey: 'dbm',
      created_at: '2023-01-03T00:00:00Z',
      updated_at: '2023-01-03T00:00:00Z',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基本機能', () => {
    it('空のクエリでは候補を返さない', () => {
      const { result } = renderHook(() =>
        useSearchSuggestions(mockPrompts, '', {})
      )

      expect(result.current.suggestions).toHaveLength(0)
      expect(result.current.isVisible).toBe(false)
      expect(result.current.count).toBe(0)
    })

    it('無効化されている場合は候補を返さない', () => {
      const { result } = renderHook(() =>
        useSearchSuggestions(mockPrompts, 'test', { disabled: true })
      )

      expect(result.current.suggestions).toHaveLength(0)
      expect(result.current.isVisible).toBe(false)
    })

    it('最大候補数を制限する', () => {
      const { result } = renderHook(() =>
        useSearchSuggestions(mockPrompts, '#', { maxSuggestions: 2 })
      )

      expect(result.current.suggestions.length).toBeLessThanOrEqual(2)
    })
  })

  describe('タグ候補', () => {
    it('#で始まる場合にタグ候補を生成する', () => {
      const { result } = renderHook(() =>
        useSearchSuggestions(mockPrompts, '#', {})
      )

      const tagSuggestions = result.current.suggestions.filter(s => s.type === 'tag')
      expect(tagSuggestions.length).toBeGreaterThan(0)
      
      tagSuggestions.forEach(suggestion => {
        expect(suggestion.text).toMatch(/^#/)
        expect(suggestion.value).toMatch(/^#\w+ $/)
        expect(suggestion.description).toMatch(/^タグ:/)
      })
    })

    it('部分一致でタグをフィルタリングする', () => {
      const { result } = renderHook(() =>
        useSearchSuggestions(mockPrompts, '#re', {})
      )

      const tagSuggestions = result.current.suggestions.filter(s => s.type === 'tag')
      expect(tagSuggestions.length).toBeGreaterThan(0)
      
      tagSuggestions.forEach(suggestion => {
        expect(suggestion.text.toLowerCase()).toContain('re')
        expect(suggestion.matchRange).toBeDefined()
      })
    })

    it('タグ候補を無効にできる', () => {
      const { result } = renderHook(() =>
        useSearchSuggestions(mockPrompts, '#react', { includeTags: false })
      )

      const tagSuggestions = result.current.suggestions.filter(s => s.type === 'tag')
      expect(tagSuggestions).toHaveLength(0)
    })

    it('複数の単語がある場合、最後の単語でタグ候補を生成する', () => {
      const { result } = renderHook(() =>
        useSearchSuggestions(mockPrompts, 'hello world #re', {})
      )

      const tagSuggestions = result.current.suggestions.filter(s => s.type === 'tag')
      expect(tagSuggestions.length).toBeGreaterThan(0)
      
      tagSuggestions.forEach(suggestion => {
        expect(suggestion.value).toMatch(/^hello world #\w+ $/)
      })
    })
  })

  describe('クイックアクセス候補', () => {
    it('/で始まる場合にクイックアクセス候補を生成する', () => {
      const { result } = renderHook(() =>
        useSearchSuggestions(mockPrompts, '/', {})
      )

      const quickAccessSuggestions = result.current.suggestions.filter(s => s.type === 'quickAccess')
      expect(quickAccessSuggestions.length).toBeGreaterThan(0)
      
      quickAccessSuggestions.forEach(suggestion => {
        expect(suggestion.text).toMatch(/^\//)
        expect(suggestion.value).toMatch(/^\/\w+ $/)
        expect(suggestion.description).toMatch(/^クイックアクセス:/)
      })
    })

    it('部分一致でクイックアクセスキーをフィルタリングする', () => {
      const { result } = renderHook(() =>
        useSearchSuggestions(mockPrompts, '/r', {})
      )

      const quickAccessSuggestions = result.current.suggestions.filter(s => s.type === 'quickAccess')
      expect(quickAccessSuggestions.length).toBeGreaterThan(0)
      
      quickAccessSuggestions.forEach(suggestion => {
        expect(suggestion.text.toLowerCase()).toContain('r')
        expect(suggestion.matchRange).toBeDefined()
      })
    })

    it('クイックアクセス候補を無効にできる', () => {
      const { result } = renderHook(() =>
        useSearchSuggestions(mockPrompts, '/rct', { includeQuickAccess: false })
      )

      const quickAccessSuggestions = result.current.suggestions.filter(s => s.type === 'quickAccess')
      expect(quickAccessSuggestions).toHaveLength(0)
    })

    it('複数の単語がある場合、最後の単語でクイックアクセス候補を生成する', () => {
      const { result } = renderHook(() =>
        useSearchSuggestions(mockPrompts, 'hello world /r', {})
      )

      const quickAccessSuggestions = result.current.suggestions.filter(s => s.type === 'quickAccess')
      expect(quickAccessSuggestions.length).toBeGreaterThan(0)
      
      quickAccessSuggestions.forEach(suggestion => {
        expect(suggestion.value).toMatch(/^hello world \/\w+ $/)
      })
    })
  })


  describe('候補の優先度', () => {
    it('クイックアクセス > タグの順で優先度が設定される', () => {
      const { result } = renderHook(() =>
        useSearchSuggestions(mockPrompts, 'r', {})
      )

      const suggestions = result.current.suggestions
      let lastPriority = 0
      
      suggestions.forEach(suggestion => {
        const priority = suggestion.type === 'quickAccess' ? 1 
                      : suggestion.type === 'tag' ? 2 
                      : 3
        
        expect(priority).toBeGreaterThanOrEqual(lastPriority)
        lastPriority = priority
      })
    })

    it('同じタイプの候補はマッチ位置で優先度が決まる', () => {
      const { result } = renderHook(() =>
        useSearchSuggestions(mockPrompts, '#e', {})
      )

      const tagSuggestions = result.current.suggestions.filter(s => s.type === 'tag')
      
      if (tagSuggestions.length > 1) {
        for (let i = 1; i < tagSuggestions.length; i++) {
          const prev = tagSuggestions[i - 1]
          const current = tagSuggestions[i]
          
          if (prev.matchRange && current.matchRange) {
            expect(prev.matchRange.start).toBeLessThanOrEqual(current.matchRange.start)
          }
        }
      }
    })
  })

  describe('エッジケース', () => {
    it('プロンプトが空の場合も正常に動作する', () => {
      const { result } = renderHook(() =>
        useSearchSuggestions([], 'test', {})
      )

      expect(result.current.suggestions).toHaveLength(0)
      expect(result.current.isVisible).toBe(false)
    })

    it('タグやクイックアクセスキーがないプロンプトでも正常に動作する', () => {
      const emptyPrompts: Prompt[] = [{
        id: '1',
        title: 'Test',
        content: 'Test content',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      }]

      const { result } = renderHook(() =>
        useSearchSuggestions(emptyPrompts, '#test', {})
      )

      expect(result.current.suggestions).toHaveLength(0)
    })

    it('空白文字のみのクエリでは候補を返さない', () => {
      const { result } = renderHook(() =>
        useSearchSuggestions(mockPrompts, '   ', {})
      )

      expect(result.current.suggestions).toHaveLength(0)
      expect(result.current.isVisible).toBe(false)
    })

    it('重複するタグやクイックアクセスキーを適切に処理する', () => {
      const duplicatePrompts: Prompt[] = [
        ...mockPrompts,
        {
          id: '4',
          title: 'Another React',
          content: 'Another React prompt',
          tags: ['react', 'frontend'], // 重複するタグ
          quickAccessKey: 'rct', // 重複するクイックアクセスキー
          created_at: '2023-01-04T00:00:00Z',
          updated_at: '2023-01-04T00:00:00Z',
        }
      ]

      const { result } = renderHook(() =>
        useSearchSuggestions(duplicatePrompts, '#react', {})
      )

      const tagSuggestions = result.current.suggestions.filter(s => s.type === 'tag')
      const reactSuggestions = tagSuggestions.filter(s => s.text === '#react')
      
      // 重複した候補は1つだけ表示される
      expect(reactSuggestions).toHaveLength(1)
    })
  })
})
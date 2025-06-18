import { renderHook } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import type { Prompt } from '../types'

import { useInlineCompletion } from './useInlineCompletion'

describe('useInlineCompletion', () => {
  const mockPrompts: Prompt[] = [
    {
      id: '1',
      title: 'React Component',
      content: 'Create a React component',
      tags: ['react', 'frontend', 'typescript'],
      quickAccessKey: 'react',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    },
    {
      id: '2',
      title: 'Code Review',
      content: 'Review this code',
      tags: ['review', 'quality', 'refactor'],
      quickAccessKey: 'review',
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

  describe('クイックアクセスキー補完', () => {
    it('/r で react を補完する', () => {
      const { result } = renderHook(() =>
        useInlineCompletion(mockPrompts, '/r')
      )

      expect(result.current.completion).toBe('eact')
      expect(result.current.fullText).toBe('/react')
      expect(result.current.type).toBe('quickAccess')
    })

    it('/re で react を補完する', () => {
      const { result } = renderHook(() =>
        useInlineCompletion(mockPrompts, '/re')
      )

      expect(result.current.completion).toBe('act')
      expect(result.current.fullText).toBe('/react')
      expect(result.current.type).toBe('quickAccess')
    })

    it('完全一致の場合は補完しない', () => {
      const { result } = renderHook(() =>
        useInlineCompletion(mockPrompts, '/react')
      )

      expect(result.current.completion).toBe('')
      expect(result.current.fullText).toBe('/react')
      expect(result.current.type).toBe(null)
    })

    it('一致しない場合は補完しない', () => {
      const { result } = renderHook(() =>
        useInlineCompletion(mockPrompts, '/xyz')
      )

      expect(result.current.completion).toBe('')
      expect(result.current.fullText).toBe('/xyz')
      expect(result.current.type).toBe(null)
    })

    it('複数の候補がある場合は最初の候補を使用', () => {
      const { result } = renderHook(() =>
        useInlineCompletion(mockPrompts, '/re')
      )

      // review より react が先にソートされるはず
      expect(result.current.completion).toBe('act')
      expect(result.current.fullText).toBe('/react')
      expect(result.current.type).toBe('quickAccess')
    })
  })

  describe('タグ補完', () => {
    it('#r で refactor を補完する', () => {
      const { result } = renderHook(() =>
        useInlineCompletion(mockPrompts, '#r')
      )

      // アルファベット順でrefactorが最初
      expect(result.current.completion).toBe('eact')
      expect(result.current.fullText).toBe('#react')
      expect(result.current.type).toBe('tag')
    })

    it('#f で frontend を補完する', () => {
      const { result } = renderHook(() =>
        useInlineCompletion(mockPrompts, '#f')
      )

      expect(result.current.completion).toBe('rontend')
      expect(result.current.fullText).toBe('#frontend')
      expect(result.current.type).toBe('tag')
    })

    it('完全一致の場合は補完しない', () => {
      const { result } = renderHook(() =>
        useInlineCompletion(mockPrompts, '#react')
      )

      expect(result.current.completion).toBe('')
      expect(result.current.fullText).toBe('#react')
      expect(result.current.type).toBe(null)
    })

    it('一致しない場合は補完しない', () => {
      const { result } = renderHook(() =>
        useInlineCompletion(mockPrompts, '#xyz')
      )

      expect(result.current.completion).toBe('')
      expect(result.current.fullText).toBe('#xyz')
      expect(result.current.type).toBe(null)
    })
  })

  describe('複数項目での補完', () => {
    it('スペース区切りの最後の項目で補完する', () => {
      const { result } = renderHook(() =>
        useInlineCompletion(mockPrompts, 'test #r')
      )

      expect(result.current.completion).toBe('eact')
      expect(result.current.fullText).toBe('test #react')
      expect(result.current.type).toBe('tag')
    })

    it('複数のタグがある場合も最後の項目で補完する', () => {
      const { result } = renderHook(() =>
        useInlineCompletion(mockPrompts, '#frontend /r')
      )

      expect(result.current.completion).toBe('eact')
      expect(result.current.fullText).toBe('#frontend /react')
      expect(result.current.type).toBe('quickAccess')
    })
  })

  describe('エッジケース', () => {
    it('空のクエリでは補完しない', () => {
      const { result } = renderHook(() =>
        useInlineCompletion(mockPrompts, '')
      )

      expect(result.current.completion).toBe('')
      expect(result.current.fullText).toBe('')
      expect(result.current.type).toBe(null)
    })

    it('/だけでも最初の候補を補完する', () => {
      const { result } = renderHook(() =>
        useInlineCompletion(mockPrompts, '/')
      )

      expect(result.current.completion).toBe('dbm')
      expect(result.current.fullText).toBe('/dbm')
      expect(result.current.type).toBe('quickAccess')
    })

    it('#だけでも最初の候補を補完する', () => {
      const { result } = renderHook(() =>
        useInlineCompletion(mockPrompts, '#')
      )

      expect(result.current.completion).toBe('backend')
      expect(result.current.fullText).toBe('#backend')
      expect(result.current.type).toBe('tag')
    })

    it('disabled=trueの場合は補完しない', () => {
      const { result } = renderHook(() =>
        useInlineCompletion(mockPrompts, '/r', { disabled: true })
      )

      expect(result.current.completion).toBe('')
      expect(result.current.fullText).toBe('/r')
      expect(result.current.type).toBe(null)
    })

    it('プロンプトが空の場合は補完しない', () => {
      const { result } = renderHook(() =>
        useInlineCompletion([], '/r')
      )

      expect(result.current.completion).toBe('')
      expect(result.current.fullText).toBe('/r')
      expect(result.current.type).toBe(null)
    })

    it('プロンプトが空で/だけの場合も補完しない', () => {
      const { result } = renderHook(() =>
        useInlineCompletion([], '/')
      )

      expect(result.current.completion).toBe('')
      expect(result.current.fullText).toBe('/')
      expect(result.current.type).toBe(null)
    })

    it('プロンプトが空で#だけの場合も補完しない', () => {
      const { result } = renderHook(() =>
        useInlineCompletion([], '#')
      )

      expect(result.current.completion).toBe('')
      expect(result.current.fullText).toBe('#')
      expect(result.current.type).toBe(null)
    })
  })

  describe('大文字小文字の処理', () => {
    it('大文字入力でも小文字で一致する', () => {
      const { result } = renderHook(() =>
        useInlineCompletion(mockPrompts, '/R')
      )

      expect(result.current.completion).toBe('eact')
      expect(result.current.fullText).toBe('/React')
      expect(result.current.type).toBe('quickAccess')
    })

    it('大文字小文字混在でも正しく補完する', () => {
      const { result } = renderHook(() =>
        useInlineCompletion(mockPrompts, '/Re')
      )

      expect(result.current.completion).toBe('act')
      expect(result.current.fullText).toBe('/React')
      expect(result.current.type).toBe('quickAccess')
    })
  })
})
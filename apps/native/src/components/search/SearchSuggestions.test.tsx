import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import type { SearchSuggestion } from '../../hooks/useSearchSuggestions'

import { SearchSuggestions } from './SearchSuggestions'

describe('SearchSuggestions', () => {
  const mockSuggestions: SearchSuggestion[] = [
    {
      id: 'tag-react',
      type: 'tag',
      text: '#react',
      value: '#react ',
      description: 'タグ: react',
      matchRange: { start: 1, end: 3 }
    },
    {
      id: 'quickaccess-rct',
      type: 'quickAccess',
      text: '/rct',
      value: '/rct ',
      description: 'クイックアクセス: rct'
    },
    {
      id: 'text-react-component',
      type: 'text',
      text: 'react component',
      value: 'react component',
      description: 'テキスト',
      matchRange: { start: 0, end: 5 }
    }
  ]

  const defaultProps = {
    suggestions: mockSuggestions,
    isVisible: true,
    selectedIndex: 0,
    onSelect: vi.fn(),
    onEscape: vi.fn()
  }

  describe('基本表示', () => {
    it('候補が表示される', () => {
      render(<SearchSuggestions {...defaultProps} />)

      expect(screen.getByRole('listbox')).toBeInTheDocument()
      
      // テキストが分割されている可能性があるため、部分一致で確認
      expect(screen.getByText((content, element) => {
        return element?.textContent === '#react'
      })).toBeInTheDocument()
      
      expect(screen.getByText('/rct')).toBeInTheDocument()
      
      expect(screen.getByText((content, element) => {
        return element?.textContent === 'react component'
      })).toBeInTheDocument()
    })

    it('非表示の場合は何も表示されない', () => {
      render(<SearchSuggestions {...defaultProps} isVisible={false} />)

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('候補が空の場合は何も表示されない', () => {
      render(<SearchSuggestions {...defaultProps} suggestions={[]} />)

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('各候補に適切なデータ属性が設定される', () => {
      render(<SearchSuggestions {...defaultProps} />)

      expect(screen.getByTestId('suggestion-tag-0')).toBeInTheDocument()
      expect(screen.getByTestId('suggestion-quickAccess-1')).toBeInTheDocument()
      expect(screen.getByTestId('suggestion-text-2')).toBeInTheDocument()
    })
  })

  describe('候補の種類別表示', () => {
    it('タグ候補に適切なアイコンとスタイルが適用される', () => {
      render(<SearchSuggestions {...defaultProps} />)

      const tagSuggestion = screen.getByTestId('suggestion-tag-0')
      expect(tagSuggestion).toBeInTheDocument()
      expect(tagSuggestion.querySelector('div')).toHaveTextContent('#')
    })

    it('クイックアクセス候補に適切なアイコンとスタイルが適用される', () => {
      render(<SearchSuggestions {...defaultProps} />)

      const quickAccessSuggestion = screen.getByTestId('suggestion-quickAccess-1')
      expect(quickAccessSuggestion).toBeInTheDocument()
      expect(quickAccessSuggestion.querySelector('div')).toHaveTextContent('/')
    })

    it('テキスト候補に適切なアイコンとスタイルが適用される', () => {
      render(<SearchSuggestions {...defaultProps} />)

      const textSuggestion = screen.getByTestId('suggestion-text-2')
      expect(textSuggestion).toBeInTheDocument()
      expect(textSuggestion.querySelector('div')).toHaveTextContent('📝')
    })
  })

  describe('テキストハイライト', () => {
    it('マッチした部分がハイライトされる', () => {
      render(<SearchSuggestions {...defaultProps} />)

      // タグ候補のハイライト（#react の "re" 部分）
      const tagHighlight = screen.getByText('re')
      expect(tagHighlight).toHaveClass('bg-yellow-200')

      // 履歴候補のハイライト（react component の "react" 部分）
      const historyHighlight = screen.getByText('react')
      expect(historyHighlight).toHaveClass('bg-yellow-200')
    })

    it('マッチ範囲がない場合はハイライトされない', () => {
      const suggestionsWithoutMatch: SearchSuggestion[] = [{
        id: 'no-match',
        type: 'quickAccess',
        text: '/rct',
        value: '/rct ',
        description: 'クイックアクセス: rct'
        // matchRange がない
      }]

      render(
        <SearchSuggestions 
          {...defaultProps} 
          suggestions={suggestionsWithoutMatch} 
        />
      )

      expect(screen.getByText('/rct')).not.toHaveClass('bg-yellow-200')
    })
  })

  describe('選択状態', () => {
    it('選択された候補にハイライトスタイルが適用される', () => {
      render(<SearchSuggestions {...defaultProps} selectedIndex={1} />)

      const selectedSuggestion = screen.getByTestId('suggestion-quickAccess-1')
      expect(selectedSuggestion).toHaveClass('bg-blue-100', 'text-blue-900')

      const unselectedSuggestion = screen.getByTestId('suggestion-tag-0')
      expect(unselectedSuggestion).not.toHaveClass('bg-blue-100', 'text-blue-900')
    })

    it('選択された候補にインジケーターが表示される', () => {
      render(<SearchSuggestions {...defaultProps} selectedIndex={0} />)

      const selectedSuggestion = screen.getByTestId('suggestion-tag-0')
      const indicator = selectedSuggestion.querySelector('svg')
      expect(indicator).toBeInTheDocument()
    })

    it('選択されていない候補にはインジケーターが表示されない', () => {
      render(<SearchSuggestions {...defaultProps} selectedIndex={0} />)

      const unselectedSuggestion = screen.getByTestId('suggestion-quickAccess-1')
      const indicator = unselectedSuggestion.querySelector('svg')
      expect(indicator).not.toBeInTheDocument()
    })

    it('aria-selected属性が適切に設定される', () => {
      render(<SearchSuggestions {...defaultProps} selectedIndex={1} />)

      expect(screen.getByTestId('suggestion-tag-0')).toHaveAttribute('aria-selected', 'false')
      expect(screen.getByTestId('suggestion-quickAccess-1')).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByTestId('suggestion-text-2')).toHaveAttribute('aria-selected', 'false')
    })
  })

  describe('インタラクション', () => {
    it('候補をクリックするとonSelectが呼ばれる', () => {
      const onSelect = vi.fn()
      render(<SearchSuggestions {...defaultProps} onSelect={onSelect} />)

      fireEvent.click(screen.getByTestId('suggestion-tag-0'))
      expect(onSelect).toHaveBeenCalledWith(mockSuggestions[0])
    })

    it('マウスダウン時にpreventDefaultが呼ばれる', () => {
      render(<SearchSuggestions {...defaultProps} />)

      const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true })
      const preventDefaultSpy = vi.spyOn(mouseDownEvent, 'preventDefault')

      const suggestion = screen.getByTestId('suggestion-tag-0')
      suggestion.dispatchEvent(mouseDownEvent)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('Escapeキーを押すとonEscapeが呼ばれる', () => {
      const onEscape = vi.fn()
      render(<SearchSuggestions {...defaultProps} onEscape={onEscape} />)

      const listbox = screen.getByRole('listbox')
      fireEvent.keyDown(listbox, { key: 'Escape' })

      expect(onEscape).toHaveBeenCalled()
    })

    it('他のキーは親に委譲される', () => {
      const onKeyDown = vi.fn()
      render(<SearchSuggestions {...defaultProps} onKeyDown={onKeyDown} />)

      const listbox = screen.getByRole('listbox')
      fireEvent.keyDown(listbox, { key: 'ArrowDown' })

      expect(onKeyDown).toHaveBeenCalledWith(expect.objectContaining({
        key: 'ArrowDown'
      }))
    })
  })

  describe('説明文表示', () => {
    it('説明文がある場合は表示される', () => {
      render(<SearchSuggestions {...defaultProps} />)

      expect(screen.getByText('タグ: react')).toBeInTheDocument()
      expect(screen.getByText('クイックアクセス: rct')).toBeInTheDocument()
      expect(screen.getByText('テキスト')).toBeInTheDocument()
    })

    it('説明文がない場合は表示されない', () => {
      const suggestionsWithoutDescription: SearchSuggestion[] = [{
        id: 'no-description',
        type: 'tag',
        text: '#test',
        value: '#test '
        // description がない
      }]

      render(
        <SearchSuggestions 
          {...defaultProps} 
          suggestions={suggestionsWithoutDescription} 
        />
      )

      // 説明文用のdivが存在しないことを確認
      const suggestion = screen.getByTestId('suggestion-tag-0')
      const descriptionDiv = suggestion.querySelector('.text-xs.text-gray-500')
      expect(descriptionDiv).not.toBeInTheDocument()
    })
  })

  describe('フッター情報', () => {
    it('候補数とキーボードショートカットの説明が表示される', () => {
      render(<SearchSuggestions {...defaultProps} />)

      expect(screen.getByText(/3件の候補/)).toBeInTheDocument()
      expect(screen.getByText(/↑↓で選択/)).toBeInTheDocument()
      expect(screen.getByText(/Enterで決定/)).toBeInTheDocument()
      expect(screen.getByText(/Escで閉じる/)).toBeInTheDocument()
    })
  })

  describe('アクセシビリティ', () => {
    it('適切なrole属性が設定される', () => {
      render(<SearchSuggestions {...defaultProps} />)

      expect(screen.getByRole('listbox')).toBeInTheDocument()
      expect(screen.getAllByRole('option')).toHaveLength(3)
    })

    it('aria-label属性が設定される', () => {
      render(<SearchSuggestions {...defaultProps} />)

      expect(screen.getByRole('listbox')).toHaveAttribute('aria-label', '検索候補')
    })
  })

  describe('カスタムクラス', () => {
    it('カスタムクラスが適用される', () => {
      render(<SearchSuggestions {...defaultProps} className="custom-class" />)

      expect(screen.getByRole('listbox')).toHaveClass('custom-class')
    })
  })
})
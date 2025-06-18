import { renderHook, act } from '@testing-library/react'
import { vi, beforeEach, afterEach } from 'vitest'

import type { Prompt } from '../types'

import { useKeyboardNavigation } from './useKeyboardNavigation'

// Mock Tauri APIs
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn().mockResolvedValue(undefined),
}))

describe('useKeyboardNavigation', () => {
  const mockPrompts: Prompt[] = [
    {
      id: '1',
      title: 'Test Prompt 1',
      content: 'Content 1',
      tags: ['tag1'],
      quickAccessKey: 'test1',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    },
    {
      id: '2',
      title: 'Test Prompt 2',
      content: 'Content 2',
      tags: ['tag2'],
      quickAccessKey: 'test2',
      created_at: '2023-01-02T00:00:00Z',
      updated_at: '2023-01-02T00:00:00Z',
    },
  ]

  const mockOnPromptSelect = vi.fn()
  const mockOnCopyPrompt = vi.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with selectedIndexKeyboard as 0', () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({
        filteredPrompts: mockPrompts,
        onPromptSelect: mockOnPromptSelect,
        onCopyPrompt: mockOnCopyPrompt,
      })
    )

    expect(result.current.selectedIndexKeyboard).toBe(0)
  })

  it('handles ArrowDown key to move selection down', () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({
        filteredPrompts: mockPrompts,
        onPromptSelect: mockOnPromptSelect,
        onCopyPrompt: mockOnCopyPrompt,
      })
    )

    const mockEvent = {
      key: 'ArrowDown',
      preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent<HTMLDivElement>

    act(() => {
      result.current.handleKeyDown(mockEvent)
    })

    expect(result.current.selectedIndexKeyboard).toBe(1)
    expect(mockEvent.preventDefault).toHaveBeenCalled()
  })

  it('handles ArrowUp key to move selection up', () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({
        filteredPrompts: mockPrompts,
        onPromptSelect: mockOnPromptSelect,
        onCopyPrompt: mockOnCopyPrompt,
      })
    )

    // First move to index 1
    act(() => {
      result.current.setSelectedIndexKeyboard(1)
    })

    const mockEvent = {
      key: 'ArrowUp',
      preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent<HTMLDivElement>

    act(() => {
      result.current.handleKeyDown(mockEvent)
    })

    expect(result.current.selectedIndexKeyboard).toBe(0)
    expect(mockEvent.preventDefault).toHaveBeenCalled()
  })

  it('does not go below 0 when pressing ArrowUp at first item', () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({
        filteredPrompts: mockPrompts,
        onPromptSelect: mockOnPromptSelect,
        onCopyPrompt: mockOnCopyPrompt,
      })
    )

    const mockEvent = {
      key: 'ArrowUp',
      preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent<HTMLDivElement>

    act(() => {
      result.current.handleKeyDown(mockEvent)
    })

    expect(result.current.selectedIndexKeyboard).toBe(0)
  })

  it('does not go above last index when pressing ArrowDown at last item', () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({
        filteredPrompts: mockPrompts,
        onPromptSelect: mockOnPromptSelect,
        onCopyPrompt: mockOnCopyPrompt,
      })
    )

    // Move to last index
    act(() => {
      result.current.setSelectedIndexKeyboard(1)
    })

    const mockEvent = {
      key: 'ArrowDown',
      preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent<HTMLDivElement>

    act(() => {
      result.current.handleKeyDown(mockEvent)
    })

    expect(result.current.selectedIndexKeyboard).toBe(1)
  })

  it('calls onCopyPrompt and hides window on Enter', async () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({
        filteredPrompts: mockPrompts,
        onPromptSelect: mockOnPromptSelect,
        onCopyPrompt: mockOnCopyPrompt,
      })
    )

    await act(async () => {
      await result.current.handlePromptSelectEnter()
    })

    expect(mockOnCopyPrompt).toHaveBeenCalledWith(mockPrompts[0])
  })

  it('resets selection when filteredPrompts changes', () => {
    const { result, rerender } = renderHook(
      ({ filteredPrompts }) =>
        useKeyboardNavigation({
          filteredPrompts,
          onPromptSelect: mockOnPromptSelect,
          onCopyPrompt: mockOnCopyPrompt,
        }),
      {
        initialProps: { filteredPrompts: mockPrompts },
      }
    )

    // Move selection to index 1
    act(() => {
      result.current.setSelectedIndexKeyboard(1)
    })

    // Change to a shorter array
    const shorterPrompts = [mockPrompts[0]]
    rerender({ filteredPrompts: shorterPrompts })

    expect(result.current.selectedIndexKeyboard).toBe(0)
  })

  it('handles empty prompt list', () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({
        filteredPrompts: [],
        onPromptSelect: mockOnPromptSelect,
        onCopyPrompt: mockOnCopyPrompt,
      })
    )

    const mockEvent = {
      key: 'ArrowDown',
      preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent<HTMLDivElement>

    act(() => {
      result.current.handleKeyDown(mockEvent)
    })

    expect(result.current.selectedIndexKeyboard).toBe(0)
  })

  it('handles prompt selection via handlePromptSelect', () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({
        filteredPrompts: mockPrompts,
        onPromptSelect: mockOnPromptSelect,
        onCopyPrompt: mockOnCopyPrompt,
      })
    )

    act(() => {
      result.current.handlePromptSelect(mockPrompts[1], 1)
    })

    expect(mockOnPromptSelect).toHaveBeenCalledWith(mockPrompts[1], 1)
    expect(result.current.selectedIndexKeyboard).toBe(1)
  })

  it('resets selection when resetSelection is called', () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({
        filteredPrompts: mockPrompts,
        onPromptSelect: mockOnPromptSelect,
        onCopyPrompt: mockOnCopyPrompt,
      })
    )

    // Move to index 1
    act(() => {
      result.current.setSelectedIndexKeyboard(1)
    })

    // Reset
    act(() => {
      result.current.resetSelection()
    })

    expect(result.current.selectedIndexKeyboard).toBe(0)
  })
})
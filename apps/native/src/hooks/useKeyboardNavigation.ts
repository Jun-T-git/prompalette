import { invoke } from '@tauri-apps/api/core'
import { useState, useCallback } from 'react'

import type { Prompt } from '../types'
import { logger } from '../utils'

interface UseKeyboardNavigationProps {
  filteredPrompts: Prompt[]
  onPromptSelect: (prompt: Prompt, index: number) => void
  onCopyPrompt: (prompt: Prompt) => Promise<void>
}

/**
 * キーボードナビゲーションカスタムフック
 * 矢印キー、Enter、Escapeキーの処理を管理
 */
export function useKeyboardNavigation({
  filteredPrompts,
  onPromptSelect,
  onCopyPrompt,
}: UseKeyboardNavigationProps) {
  const [selectedIndexKeyboard, setSelectedIndexKeyboard] = useState(0)
  const [isComposing, setIsComposing] = useState(false)

  const handleKeyDown = useCallback(async (e: React.KeyboardEvent<HTMLDivElement | HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (filteredPrompts.length > 0) {
          setSelectedIndexKeyboard(prev => 
            Math.min(prev + 1, filteredPrompts.length - 1)
          )
        }
        break
        
      case 'ArrowUp':
        e.preventDefault()
        if (filteredPrompts.length > 0) {
          setSelectedIndexKeyboard(prev => Math.max(prev - 1, 0))
        }
        break
        
      case 'Escape':
        if (isComposing) return
        
        e.preventDefault()
        try {
          await invoke('hide_main_window')
        } catch (error) {
          logger.error('Failed to hide window:', error)
        }
        break
    }
  }, [filteredPrompts.length, isComposing])

  const handlePromptSelectEnter = useCallback(async () => {
    if (filteredPrompts.length > 0 && filteredPrompts[selectedIndexKeyboard]) {
      const selectedPrompt = filteredPrompts[selectedIndexKeyboard]
      if (selectedPrompt) {
        await onCopyPrompt(selectedPrompt)
        try {
          await invoke('hide_main_window')
        } catch (error) {
          logger.error('Failed to hide window:', error)
        }
      }
    }
  }, [filteredPrompts, selectedIndexKeyboard, onCopyPrompt])

  const handlePromptSelect = useCallback((prompt: Prompt, index: number) => {
    onPromptSelect(prompt, index)
    setSelectedIndexKeyboard(index)
  }, [onPromptSelect])

  // 検索結果変更時にインデックスをリセット
  const resetSelection = useCallback(() => {
    setSelectedIndexKeyboard(0)
  }, [])

  return {
    selectedIndexKeyboard,
    isComposing,
    setIsComposing,
    setSelectedIndexKeyboard,
    handleKeyDown,
    handlePromptSelectEnter,
    handlePromptSelect,
    resetSelection,
  }
}
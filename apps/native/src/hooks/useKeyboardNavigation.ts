import { invoke } from '@tauri-apps/api/core'
import { useState, useCallback, useEffect, useMemo, useRef } from 'react'

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
  const filteredPromptsRef = useRef(filteredPrompts)
  
  // Update ref when filteredPrompts changes
  useEffect(() => {
    filteredPromptsRef.current = filteredPrompts
  }, [filteredPrompts])

  // Reset selected index when filtered prompts length changes
  useEffect(() => {
    setSelectedIndexKeyboard(prev => {
      if (filteredPrompts.length === 0) {
        return 0
      } else if (prev >= filteredPrompts.length) {
        return Math.max(0, filteredPrompts.length - 1)
      }
      return prev
    })
  }, [filteredPrompts.length])

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
    const currentPrompts = filteredPromptsRef.current
    if (currentPrompts.length > 0 && selectedIndexKeyboard >= 0 && selectedIndexKeyboard < currentPrompts.length) {
      const selectedPrompt = currentPrompts[selectedIndexKeyboard]
      if (selectedPrompt) {
        await onCopyPrompt(selectedPrompt)
        try {
          await invoke('hide_main_window')
        } catch (error) {
          logger.error('Failed to hide window:', error)
        }
      }
    }
  }, [selectedIndexKeyboard, onCopyPrompt])

  const handlePromptSelect = useCallback((prompt: Prompt, index: number) => {
    onPromptSelect(prompt, index)
    setSelectedIndexKeyboard(index)
  }, [onPromptSelect])

  // 検索結果変更時にインデックスをリセット
  const resetSelection = useCallback(() => {
    setSelectedIndexKeyboard(0)
  }, [])

  return useMemo(() => ({
    selectedIndexKeyboard,
    isComposing,
    setIsComposing,
    setSelectedIndexKeyboard,
    handleKeyDown,
    handlePromptSelectEnter,
    handlePromptSelect,
    resetSelection,
  }), [
    selectedIndexKeyboard,
    isComposing,
    setIsComposing,
    handleKeyDown,
    handlePromptSelectEnter,
    handlePromptSelect,
    resetSelection,
  ])
}
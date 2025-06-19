import { useState, useRef, useEffect } from 'react'

import { useFormKeyboard } from '../../hooks'
import type { Prompt, CreatePromptRequest, UpdatePromptRequest } from '../../types'
import type { ShortcutActionMap } from '../../types/keyboard-v2'
import { validatePromptTitle, validatePromptContent, validateTags, validateQuickAccessKey, parseTagsString } from '../../utils'
import { Button, Input, Textarea } from '../common'

interface PromptFormProps {
  initialData?: Prompt
  onSubmit: (data: CreatePromptRequest | UpdatePromptRequest) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function PromptForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: PromptFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    tags: initialData?.tags?.join(', ') || '',
    quickAccessKey: initialData?.quickAccessKey || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // フィールドのref
  const titleRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const tagsRef = useRef<HTMLInputElement>(null)
  const quickAccessKeyRef = useRef<HTMLInputElement>(null)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    const titleError = validatePromptTitle(formData.title)
    if (titleError) newErrors.title = titleError

    const contentError = validatePromptContent(formData.content)
    if (contentError) newErrors.content = contentError

    const tagsArray = parseTagsString(formData.tags)
    
    const tagsError = validateTags(tagsArray)
    if (tagsError) newErrors.tags = tagsError

    const quickAccessKeyError = validateQuickAccessKey(formData.quickAccessKey)
    if (quickAccessKeyError) newErrors.quickAccessKey = quickAccessKeyError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const tagsArray = parseTagsString(formData.tags)

    const submitData: CreatePromptRequest | UpdatePromptRequest = {
      title: formData.title,
      content: formData.content,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
      quickAccessKey: formData.quickAccessKey.trim() || undefined,
    }

    if (initialData) {
      ;(submitData as UpdatePromptRequest).id = initialData.id
    }

    await onSubmit(submitData)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // 保存可能かどうかのチェック
  const canSave = Boolean(formData.title.trim() && formData.content.trim() && !isLoading)

  // 保存して閉じる処理
  const handleSaveAndClose = async () => {
    const submitEvent = { preventDefault: () => {} } as React.FormEvent
    await handleSubmit(submitEvent)
  }

  // フォーム用キーボードアクション定義
  const keyboardActions: ShortcutActionMap = {
    savePrompt: async () => {
      if (canSave) {
        const submitEvent = { preventDefault: () => {} } as React.FormEvent
        await handleSubmit(submitEvent)
      }
    },
    saveAndClose: async () => {
      if (canSave) {
        await handleSaveAndClose()
      }
    },
    cancelEdit: () => {
      onCancel()
    },
    closeDialog: () => {
      onCancel()
    },
    confirmAction: async () => {
      // フォーカスされている要素に応じて適切なアクションを実行
      const activeElement = document.activeElement
      if (activeElement?.getAttribute('type') === 'submit') {
        if (canSave) {
          const submitEvent = { preventDefault: () => {} } as React.FormEvent
          await handleSubmit(submitEvent)
        }
      }
    },
    focusNextField: () => {
      const currentElement = document.activeElement
      const fields = [titleRef, contentRef, tagsRef, quickAccessKeyRef]
      const currentIndex = fields.findIndex(ref => ref.current === currentElement)
      
      if (currentIndex >= 0 && currentIndex < fields.length - 1) {
        const nextField = fields[currentIndex + 1]
        if (nextField?.current) {
          setFocus(nextField.current, true)
        }
      }
    },
    focusPrevField: () => {
      const currentElement = document.activeElement
      const fields = [titleRef, contentRef, tagsRef, quickAccessKeyRef]
      const currentIndex = fields.findIndex(ref => ref.current === currentElement)
      
      if (currentIndex > 0) {
        const prevField = fields[currentIndex - 1]
        if (prevField?.current) {
          setFocus(prevField.current, true)
        }
      }
    },
    indentText: () => {
      if (contentRef.current && document.activeElement === contentRef.current) {
        insertTextAtCursor(contentRef.current, '\t')
      }
    },
    unindentText: () => {
      if (contentRef.current && document.activeElement === contentRef.current) {
        removeIndentAtCursor(contentRef.current)
      }
    }
  }

  // フォーム用キーボード管理
  const { setFocus, announce } = useFormKeyboard(keyboardActions, {
    userLevel: 'intermediate',
    enabled: true,
    debug: false
  })

  // テキストエリアでのインデント操作
  const insertTextAtCursor = (textarea: HTMLTextAreaElement, text: string) => {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const value = textarea.value

    const newValue = value.substring(0, start) + text + value.substring(end)
    textarea.value = newValue
    
    // React の状態を更新
    handleInputChange('content', newValue)
    
    // カーソル位置を調整
    const newCursorPos = start + text.length
    textarea.setSelectionRange(newCursorPos, newCursorPos)
    
    // フォーカスを維持
    textarea.focus()
  }

  const removeIndentAtCursor = (textarea: HTMLTextAreaElement) => {
    const start = textarea.selectionStart
    const value = textarea.value
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    const lineText = value.substring(lineStart, start)

    let removedChars = 0
    let newValue = value

    if (lineText.startsWith('\t')) {
      newValue = value.substring(0, lineStart) + value.substring(lineStart + 1)
      removedChars = 1
    } else if (lineText.startsWith('    ')) {
      newValue = value.substring(0, lineStart) + value.substring(lineStart + 4)
      removedChars = 4
    } else if (lineText.startsWith('  ')) {
      newValue = value.substring(0, lineStart) + value.substring(lineStart + 2)
      removedChars = 2
    } else if (lineText.startsWith(' ')) {
      newValue = value.substring(0, lineStart) + value.substring(lineStart + 1)
      removedChars = 1
    }

    if (removedChars > 0) {
      textarea.value = newValue
      handleInputChange('content', newValue)
      
      const newCursorPos = Math.max(lineStart, start - removedChars)
      textarea.setSelectionRange(newCursorPos, newCursorPos)
      textarea.focus()
    }
  }

  // focusField関数を再定義
  const focusField = (fieldName: 'title' | 'content' | 'tags' | 'quickAccessKey') => {
    const fieldRef = {
      title: titleRef,
      content: contentRef,
      tags: tagsRef,
      quickAccessKey: quickAccessKeyRef
    }[fieldName]
    
    if (fieldRef.current) {
      setFocus(fieldRef.current, false)
      
      // textareaの場合は末尾にカーソル移動
      if (fieldName === 'content' && fieldRef.current instanceof HTMLTextAreaElement) {
        const length = fieldRef.current.value.length
        fieldRef.current.setSelectionRange(length, length)
      }
    }
  }

  // 初期フォーカス設定
  useEffect(() => {
    const timer = setTimeout(() => {
      if (initialData) {
        // 編集時はコンテンツフィールドの末尾にフォーカス
        focusField('content')
        announce(`「${initialData.title}」の編集モードに入りました`)
      } else {
        // 新規作成時はタイトルフィールドにフォーカス
        focusField('title')
        announce('新規プロンプト作成フォームが開きました')
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [initialData, announce])

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        ref={titleRef}
        label="タイトル *"
        value={formData.title}
        onChange={(e) => handleInputChange('title', e.target.value)}
        error={errors.title}
        placeholder="プロンプトのタイトルを入力"
        maxLength={100}
        required
      />

      <Textarea
        ref={contentRef}
        label="プロンプト内容 *"
        value={formData.content}
        onChange={(e) => handleInputChange('content', e.target.value)}
        error={errors.content}
        placeholder="プロンプトの内容を入力"
        rows={8}
        maxLength={10000}
        required
      />

      <Input
        ref={tagsRef}
        label="タグ"
        value={formData.tags}
        onChange={(e) => handleInputChange('tags', e.target.value)}
        error={errors.tags}
        placeholder="例: 開発, JavaScript, React, レビュー"
        helperText="用途・技術・対象などを自由に設定、カンマ区切りで入力（最大10個）"
      />

      <Input
        ref={quickAccessKeyRef}
        label="クイックアクセスキー"
        value={formData.quickAccessKey}
        onChange={(e) => handleInputChange('quickAccessKey', e.target.value)}
        error={errors.quickAccessKey}
        placeholder="例: rvw, code, test"
        helperText="検索で一意特定するためのキー。/rvw のように検索可能（英数字のみ、2-20文字）"
        maxLength={20}
      />

      <div className="space-y-4 pt-4 border-t">
        {/* ショートカットヒント */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm text-blue-800 font-medium mb-2">📌 キーボードショートカット</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-700">
            <div className="flex justify-between">
              <span>保存</span>
              <span className="font-mono">⌘S</span>
            </div>
            <div className="flex justify-between">
              <span>保存して閉じる</span>
              <span className="font-mono">⌘Enter</span>
            </div>
            <div className="flex justify-between">
              <span>キャンセル</span>
              <span className="font-mono">Esc</span>
            </div>
            <div className="flex justify-between">
              <span>フィールド移動</span>
              <span className="font-mono">Tab / Shift+Tab</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-blue-200 text-xs text-blue-600">
            💡 プロンプト内容でインデント操作: <span className="font-mono">⌘]</span> インデント / <span className="font-mono">⌘[</span> 逆インデント
          </div>
        </div>
        
        {/* ボタンエリア */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              announce('編集をキャンセルしました')
              onCancel()
            }}
            disabled={isLoading}
            aria-label="編集をキャンセルしてフォームを閉じます。ショートカット: エスケープ"
          >
            キャンセル
            <span className="ml-2 text-xs text-gray-400 font-mono">Esc</span>
          </Button>
          
          <Button
            type="submit"
            isLoading={isLoading}
            disabled={!canSave}
            aria-label={`プロンプトを${initialData ? '更新' : '作成'}します。ショートカット: Command S`}
          >
            {initialData ? '更新' : '作成'}
            <span className="ml-2 text-xs text-gray-300 font-mono">⌘S</span>
          </Button>
        </div>
      </div>
    </form>
  )
}
import { useState, useRef, useEffect } from 'react'

import type { Prompt, CreatePromptRequest, UpdatePromptRequest } from '../../types'
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

  // 初期フォーカス設定（シンプル版）
  useEffect(() => {
    const timer = setTimeout(() => {
      if (initialData && contentRef.current) {
        // 編集時はコンテンツフィールドの末尾にフォーカス
        contentRef.current.focus();
        const length = contentRef.current.value.length;
        contentRef.current.setSelectionRange(length, length);
      } else if (!initialData && titleRef.current) {
        // 新規作成時はタイトルフィールドにフォーカス
        titleRef.current.focus();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [initialData]);

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
            onClick={onCancel}
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
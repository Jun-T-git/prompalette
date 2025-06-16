import { useState } from 'react'

import type { Prompt, CreatePromptRequest, UpdatePromptRequest } from '../../types'
import { validatePromptTitle, validatePromptContent, validateTags } from '../../utils'
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
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    const titleError = validatePromptTitle(formData.title)
    if (titleError) newErrors.title = titleError

    const contentError = validatePromptContent(formData.content)
    if (contentError) newErrors.content = contentError

    const tagsArray = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag)
    
    const tagsError = validateTags(tagsArray)
    if (tagsError) newErrors.tags = tagsError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const tagsArray = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag)

    const submitData: CreatePromptRequest | UpdatePromptRequest = {
      title: formData.title,
      content: formData.content,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="タイトル *"
        value={formData.title}
        onChange={(e) => handleInputChange('title', e.target.value)}
        error={errors.title}
        placeholder="プロンプトのタイトルを入力"
        maxLength={100}
        required
      />

      <Textarea
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
        label="タグ"
        value={formData.tags}
        onChange={(e) => handleInputChange('tags', e.target.value)}
        error={errors.tags}
        placeholder="例: 開発, JavaScript, React, レビュー"
        helperText="用途・技術・対象などを自由に設定、カンマ区切りで入力（最大10個）"
      />

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          キャンセル
        </Button>
        
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={!formData.title.trim() || !formData.content.trim()}
        >
          {initialData ? '更新' : '作成'}
        </Button>
      </div>
    </form>
  )
}
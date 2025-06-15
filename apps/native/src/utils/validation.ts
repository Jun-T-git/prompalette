export function validatePromptTitle(title: string): string | null {
  if (!title.trim()) {
    return 'タイトルは必須です'
  }
  if (title.length > 100) {
    return 'タイトルは100文字以内で入力してください'
  }
  return null
}

export function validatePromptContent(content: string): string | null {
  if (!content.trim()) {
    return 'プロンプト内容は必須です'
  }
  if (content.length > 10000) {
    return 'プロンプト内容は10,000文字以内で入力してください'
  }
  return null
}

export function validateCategory(category?: string): string | null {
  if (category && category.length > 50) {
    return 'カテゴリは50文字以内で入力してください'
  }
  return null
}

export function validateTags(tags: string[]): string | null {
  if (tags.length > 10) {
    return 'タグは10個まで設定できます'
  }
  for (const tag of tags) {
    if (tag.length > 30) {
      return 'タグは30文字以内で入力してください'
    }
  }
  return null
}
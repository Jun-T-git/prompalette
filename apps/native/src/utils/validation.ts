/**
 * プロンプトタイトルのバリデーション
 * 空文字チェックと文字数制限を実施
 * 
 * @param title - 検証するタイトル文字列
 * @returns エラーメッセージまたはnull（バリデーション成功時）
 * 
 * @example
 * ```typescript
 * const error = validatePromptTitle('My Prompt')
 * if (error) {
 *   console.error(error) // バリデーションエラーあり
 * }
 * ```
 */
export function validatePromptTitle(title: string): string | null {
  // 空文字・空白文字のみの場合はエラー
  if (!title.trim()) {
    return 'タイトルは必須です'
  }
  // 100文字を超える場合はエラー
  if (title.length > 100) {
    return 'タイトルは100文字以内で入力してください'
  }
  return null
}

/**
 * プロンプト内容のバリデーション
 * 空文字チェックと文字数制限を実施
 * 
 * @param content - 検証するプロンプト内容
 * @returns エラーメッセージまたはnull（バリデーション成功時）
 * 
 * @example
 * ```typescript
 * const error = validatePromptContent('あなたは優秀なアシスタントです...')
 * if (error) {
 *   console.error(error)
 * }
 * ```
 */
export function validatePromptContent(content: string): string | null {
  // 空文字・空白文字のみの場合はエラー
  if (!content.trim()) {
    return 'プロンプト内容は必須です'
  }
  // 10,000文字を超える場合はエラー
  if (content.length > 10000) {
    return 'プロンプト内容は10,000文字以内で入力してください'
  }
  return null
}

/**
 * カテゴリのバリデーション
 * 任意項目のため空の場合はOK、文字数制限のみチェック
 * 
 * @param category - 検証するカテゴリ名（任意）
 * @returns エラーメッセージまたはnull（バリデーション成功時）
 * 
 * @example
 * ```typescript
 * const error = validateCategory('開発支援')
 * if (error) {
 *   console.error(error)
 * }
 * ```
 */
export function validateCategory(category?: string): string | null {
  // 任意項目のため、存在する場合のみ文字数チェック
  if (category && category.length > 50) {
    return 'カテゴリは50文字以内で入力してください'
  }
  return null
}

/**
 * タグ配列のバリデーション
 * タグ数制限と各タグの文字数制限をチェック
 * 
 * @param tags - 検証するタグの配列
 * @returns エラーメッセージまたはnull（バリデーション成功時）
 * 
 * @example
 * ```typescript
 * const error = validateTags(['AI', '文章生成', 'ChatGPT'])
 * if (error) {
 *   console.error(error)
 * }
 * ```
 */
export function validateTags(tags: string[]): string | null {
  // タグ数の上限チェック（10個まで）
  if (tags.length > 10) {
    return 'タグは10個まで設定できます'
  }
  // 各タグの文字数制限チェック（30文字以内）
  for (const tag of tags) {
    if (tag.length > 30) {
      return 'タグは30文字以内で入力してください'
    }
  }
  return null
}
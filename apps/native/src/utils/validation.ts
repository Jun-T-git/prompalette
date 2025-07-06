/**
 * プロンプトタイトルのバリデーション
 * 文字数制限をチェック（任意項目）
 * 
 * @param title - 検証するタイトル文字列（任意、nullも許可）
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
export function validatePromptTitle(title?: string | null): string | null {
  // null、undefinedの場合は問題なし（任意項目）
  if (title === null || title === undefined) {
    return null;
  }
  
  // 文字列でない場合は型エラー
  if (typeof title !== 'string') {
    return 'タイトルは文字列である必要があります';
  }
  
  // 空文字やスペースのみの場合は問題なし（任意項目）
  const trimmed = title.trim();
  if (trimmed.length === 0) {
    return null;
  }
  
  // 文字数制限チェック
  if (trimmed.length > 100) {
    return 'タイトルは100文字以内で入力してください';
  }
  
  return null;
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
 * タグ配列のバリデーション
 * タグ数制限と各タグの文字数制限をチェック
 * 
 * @param tags - 検証するタグの配列
 * @returns エラーメッセージまたはnull（バリデーション成功時）
 * 
 * @example
 * ```typescript
 * const error = validateTags(['開発', 'JavaScript', 'React'])
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

/**
 * クイックアクセスキーのバリデーション
 * 文字種制限（英数字のみ）と文字数制限をチェック
 * 
 * @param quickAccessKey - 検証するクイックアクセスキー文字列
 * @returns エラーメッセージまたはnull（バリデーション成功時）
 * 
 * @example
 * ```typescript
 * const error = validateQuickAccessKey('rvw')
 * if (error) {
 *   console.error(error)
 * }
 * ```
 */
export function validateQuickAccessKey(quickAccessKey: string): string | null {
  // 空文字の場合は問題なし（任意項目）
  if (!quickAccessKey.trim()) {
    return null
  }
  
  // 2文字未満の場合はエラー
  if (quickAccessKey.length < 2) {
    return 'クイックアクセスキーは2文字以上で入力してください'
  }
  
  // 20文字を超える場合はエラー
  if (quickAccessKey.length > 20) {
    return 'クイックアクセスキーは20文字以内で入力してください'
  }
  
  // 英数字以外が含まれている場合はエラー
  if (!/^[a-zA-Z0-9]+$/.test(quickAccessKey)) {
    return 'クイックアクセスキーは英数字のみで入力してください'
  }
  
  return null
}
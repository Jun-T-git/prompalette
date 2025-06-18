/**
 * タグ処理関連のユーティリティ関数
 */

/**
 * カンマ区切りのタグ文字列を配列に変換
 * 空白文字をトリミングし、空の要素を除去する
 * 
 * @param tagsString - カンマ区切りのタグ文字列
 * @returns タグの配列
 * 
 * @example
 * ```typescript
 * parseTagsString('react, typescript,  frontend ')
 * // => ['react', 'typescript', 'frontend']
 * ```
 */
export function parseTagsString(tagsString: string): string[] {
  return tagsString
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
}

/**
 * タグ配列をカンマ区切りの文字列に変換
 * 
 * @param tags - タグの配列
 * @returns カンマ区切りのタグ文字列
 * 
 * @example
 * ```typescript
 * formatTagsArray(['react', 'typescript', 'frontend'])
 * // => 'react, typescript, frontend'
 * ```
 */
export function formatTagsArray(tags: string[]): string {
  return tags.join(', ')
}

/**
 * タグ配列を正規化
 * 重複を除去し、空文字列を除外し、ソートする
 * 
 * @param tags - タグの配列
 * @returns 正規化されたタグの配列
 * 
 * @example
 * ```typescript
 * normalizeTags(['react', '', 'typescript', 'react', 'frontend'])
 * // => ['frontend', 'react', 'typescript']
 * ```
 */
export function normalizeTags(tags: string[]): string[] {
  const uniqueTags = Array.from(new Set(tags.filter(tag => tag.trim().length > 0)))
  return uniqueTags.sort()
}
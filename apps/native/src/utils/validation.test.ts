import { validatePromptTitle, validatePromptContent, validateTags } from './validation'

describe('validation utils', () => {
  describe('validatePromptTitle', () => {
    it('returns null for valid titles', () => {
      expect(validatePromptTitle('Valid title')).toBeNull()
      expect(validatePromptTitle('A'.repeat(100))).toBeNull()
    })

    it('returns error for empty title', () => {
      expect(validatePromptTitle('')).toBe('タイトルは必須です')
      expect(validatePromptTitle('   ')).toBe('タイトルは必須です')
    })

    it('returns error for too long title', () => {
      expect(validatePromptTitle('A'.repeat(101))).toBe('タイトルは100文字以内で入力してください')
    })
  })

  describe('validatePromptContent', () => {
    it('returns null for valid content', () => {
      expect(validatePromptContent('Valid content')).toBeNull()
      expect(validatePromptContent('A'.repeat(10000))).toBeNull()
    })

    it('returns error for empty content', () => {
      expect(validatePromptContent('')).toBe('プロンプト内容は必須です')
      expect(validatePromptContent('   ')).toBe('プロンプト内容は必須です')
    })

    it('returns error for too long content', () => {
      expect(validatePromptContent('A'.repeat(10001))).toBe('プロンプト内容は10,000文字以内で入力してください')
    })
  })


  describe('validateTags', () => {
    it('returns null for valid tags', () => {
      expect(validateTags([])).toBeNull()
      expect(validateTags(['開発', 'JavaScript'])).toBeNull()
      expect(validateTags(['開発', 'JavaScript', 'React', 'TypeScript'])).toBeNull()
      expect(validateTags(Array(10).fill('tag'))).toBeNull()
    })

    it('returns error for too many tags', () => {
      expect(validateTags(Array(11).fill('tag'))).toBe('タグは10個まで設定できます')
    })

    it('returns error for too long tag', () => {
      expect(validateTags(['A'.repeat(31)])).toBe('タグは30文字以内で入力してください')
    })

    it('handles mixed content tags correctly', () => {
      expect(validateTags(['開発', 'JavaScript', 'コードレビュー', 'AI'])).toBeNull()
      expect(validateTags(['用途カテゴリ', 'technical-tag', '対象ユーザー'])).toBeNull()
    })
  })
})
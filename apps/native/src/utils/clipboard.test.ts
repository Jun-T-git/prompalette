/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { copyToClipboard, isClipboardSupported } from './clipboard'

// Clipboard APIのモック
const mockWriteText = vi.fn()
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
})

// execCommandのモック
Object.assign(document, {
  execCommand: vi.fn(),
})

describe('clipboard utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('isClipboardSupported', () => {
    it('should return true when navigator.clipboard is available', () => {
      expect(isClipboardSupported()).toBe(true)
    })

    it('should return false when navigator.clipboard is not available', () => {
      const originalClipboard = navigator.clipboard
      // @ts-expect-error - Intentionally deleting for test
      delete navigator.clipboard
      
      expect(isClipboardSupported()).toBe(false)
      
      // Restore
      Object.assign(navigator, { clipboard: originalClipboard })
    })
  })

  describe('copyToClipboard', () => {
    it('should copy text using Clipboard API when available', async () => {
      const testText = 'テスト用プロンプト'
      mockWriteText.mockResolvedValueOnce(undefined)

      const result = await copyToClipboard(testText)

      expect(result.success).toBe(true)
      expect(mockWriteText).toHaveBeenCalledWith(testText)
    })

    it('should handle Clipboard API errors', async () => {
      const testText = 'テスト用プロンプト'
      const error = new Error('Access denied')
      mockWriteText.mockRejectedValueOnce(error)
      document.execCommand = vi.fn().mockReturnValue(false)

      const result = await copyToClipboard(testText)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Copy command failed')
    })

    it('should fallback to execCommand when Clipboard API fails', async () => {
      const testText = 'テスト用プロンプト'
      mockWriteText.mockRejectedValueOnce(new Error('Not available'))
      document.execCommand = vi.fn().mockReturnValue(true)

      const result = await copyToClipboard(testText)

      expect(result.success).toBe(true)
      expect(document.execCommand).toHaveBeenCalledWith('copy')
    })

    it('should handle empty text', async () => {
      mockWriteText.mockResolvedValueOnce(undefined)

      const result = await copyToClipboard('')

      expect(result.success).toBe(true)
      expect(mockWriteText).toHaveBeenCalledWith('')
    })

    it('should handle null text', async () => {
      const result = await copyToClipboard(null as any)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid text to copy')
    })

    it('should handle very long text', async () => {
      const longText = 'a'.repeat(10000)
      mockWriteText.mockResolvedValueOnce(undefined)

      const result = await copyToClipboard(longText)

      expect(result.success).toBe(true)
      expect(mockWriteText).toHaveBeenCalledWith(longText)
    })
  })
})
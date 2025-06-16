import { logger } from './logger'

/**
 * クリップボード操作の結果
 */
export interface ClipboardResult {
  success: boolean
  error?: string
}

/**
 * クリップボードAPIがサポートされているかチェック
 * @returns クリップボードAPIが利用可能な場合true
 */
export function isClipboardSupported(): boolean {
  return typeof navigator !== 'undefined' && 'clipboard' in navigator && 'writeText' in navigator.clipboard
}

/**
 * テキストをクリップボードにコピー
 * Modern Clipboard API を優先し、フォールバックとして execCommand を使用
 * 
 * @param text - コピーするテキスト
 * @returns コピー結果
 * 
 * @example
 * ```typescript
 * const result = await copyToClipboard('Hello, World!')
 * if (result.success) {
 *   console.log('コピー成功')
 * } else {
 *   console.error('コピー失敗:', result.error)
 * }
 * ```
 */
export async function copyToClipboard(text: string): Promise<ClipboardResult> {
  // 入力値の検証
  if (text === null || text === undefined) {
    logger.error('Invalid text to copy:', text)
    return { success: false, error: 'Invalid text to copy' }
  }

  try {
    // 現代的なClipboard APIを試す
    if (isClipboardSupported()) {
      await navigator.clipboard.writeText(text)
      logger.debug('Text copied using Clipboard API:', { length: text.length })
      return { success: true }
    }

    // フォールバック: execCommand を使用
    return fallbackCopyToClipboard(text)
  } catch (error) {
    logger.error('Clipboard API failed, trying fallback:', error)
    
    // フォールバックを試す
    return fallbackCopyToClipboard(text)
  }
}

/**
 * execCommand を使用したフォールバック実装
 * @param text - コピーするテキスト
 * @returns コピー結果
 */
function fallbackCopyToClipboard(text: string): ClipboardResult {
  try {
    // 一時的なテキストエリアを作成
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    
    // テキストを選択してコピー
    textArea.focus()
    textArea.select()
    
    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)
    
    if (successful) {
      logger.debug('Text copied using execCommand fallback:', { length: text.length })
      return { success: true }
    } else {
      logger.error('execCommand copy failed')
      return { success: false, error: 'Copy command failed' }
    }
  } catch (error) {
    logger.error('Fallback copy failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown copy error' 
    }
  }
}

/**
 * プロンプト固有のコピー機能
 * プロンプトの内容をクリップボードにコピーし、使用統計を更新
 * 
 * @param content - プロンプトの内容
 * @param promptId - プロンプトID（統計用、オプション）
 * @returns コピー結果
 */
export async function copyPromptToClipboard(
  content: string, 
  promptId?: string
): Promise<ClipboardResult> {
  const result = await copyToClipboard(content)
  
  if (result.success) {
    logger.info('Prompt copied to clipboard', { 
      promptId, 
      contentLength: content.length,
      timestamp: new Date().toISOString()
    })
  } else {
    logger.error('Failed to copy prompt to clipboard', { 
      promptId, 
      error: result.error 
    })
  }
  
  return result
}
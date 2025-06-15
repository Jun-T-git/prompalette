/**
 * Vitestテスト環境のセットアップ
 * Jest DOMマッチャーとグローバル設定を設定
 */
import '@testing-library/jest-dom'
import '@testing-library/jest-dom/vitest'

// グローバル設定
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Next.jsのルーターモック
// @ts-expect-error - Next.js router mock
global.IntersectionObserver = class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
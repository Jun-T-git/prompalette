/**
 * Vitestテスト環境のセットアップ
 * Jest DOMマッチャーとグローバル設定を設定
 */
import '@testing-library/jest-dom'
import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// グローバル設定
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// @ts-expect-error - Next.js router mock
global.IntersectionObserver = class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock window.alert for tests
global.alert = vi.fn()

// Mock window.confirm for tests
global.confirm = vi.fn(() => true)

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}

// Mock environment variables for tests
// Note: NODE_ENV is handled by Vitest automatically, so we don't need to set it
process.env.NEXT_PUBLIC_SUPABASE_URL = ''
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = ''
process.env.SUPABASE_SERVICE_ROLE_KEY = ''
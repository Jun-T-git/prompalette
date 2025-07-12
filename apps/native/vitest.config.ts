import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Test environment configuration - defaults to development
const testEnv = process.env.TEST_ENV || 'development'
const isDevelopment = testEnv === 'development'
const isStaging = testEnv === 'staging'
const isProduction = testEnv === 'production'

export default defineConfig({
  plugins: [react()],
  // Define global constants for test environment
  define: {
    __APP_ENV__: JSON.stringify(testEnv),
    __IS_DEVELOPMENT__: JSON.stringify(isDevelopment),
    __IS_STAGING__: JSON.stringify(isStaging),
    __IS_PRODUCTION__: JSON.stringify(isProduction),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    exclude: [
      'e2e/**',
      '**/*.spec.ts',
      'node_modules/**'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        'src-tauri/',
        'e2e/**',
      ],
      thresholds: {
        statements: 70,
        branches: 65,
        functions: 70,
        lines: 70,
      },
    },
  },
  // @ts-expect-error vitest types
  types: ['vitest/globals'],
})
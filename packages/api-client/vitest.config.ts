import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 15000,
    // Node.js 18 IPv6 compatibility
    env: {
      NODE_OPTIONS: process.env.NODE_OPTIONS || '--dns-result-order=ipv4first',
    },
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', '**/*.d.ts', '**/*.config.*', '**/*.test.*'],
    },
  },
});
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    globals: false,
    mockReset: true,
    restoreMocks: true,
    pool: 'forks',
    maxWorkers: 1,
    isolate: false,
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 20000,
  },
})

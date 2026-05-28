import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['backend/src/**/*.test.ts', 'frontend/src/**/*.test.ts', 'frontend/src/**/*.test.tsx'],
    pool: 'forks',
    fileParallelism: false,
    env: {
      NODE_ENV: 'test',
      LOG_LEVEL: 'silent',
    },
    setupFiles: ['./vitest.setup.ts'],
  },
});

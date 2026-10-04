import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  esbuild: { jsx: 'automatic' },
  resolve: {
    alias: {
      '@reachly/nestjs-libraries': resolve(
        __dirname,
        'libraries/nestjs-libraries/src'
      ),
      '@reachly/helpers': resolve(__dirname, 'libraries/helpers/src'),
      '@reachly/backend': resolve(__dirname, 'apps/backend/src'),
      '@reachly/frontend': resolve(__dirname, 'apps/frontend/src'),
      '@reachly/react': resolve(
        __dirname,
        'libraries/react-shared-libraries/src'
      ),
    },
  },
  test: {
    include: [
      'tests/agent-publishing/**/*.test.ts',
      'tests/agent-publishing/**/*.test.tsx',
    ],
    testTimeout: 20000,
    hookTimeout: 20000,
    maxWorkers: 1,
    minWorkers: 1,
    env: {
      FRONTEND_URL: 'http://localhost:4200',
      NEXT_PUBLIC_BACKEND_URL: 'http://localhost:3000',
      STORAGE_PROVIDER: 'local',
      UPLOAD_DIRECTORY: '/tmp/reachly-agent-test-uploads',
    },
  },
});

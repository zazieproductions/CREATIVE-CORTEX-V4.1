import { defineConfig } from 'vitest/config';

/**
 * Test runner config, deliberately separate from vite.config.ts so the browser
 * build never pulls test concerns in, and the suite runs in Node against the
 * pure `src/lib` layer (no DOM needed).
 */
export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});

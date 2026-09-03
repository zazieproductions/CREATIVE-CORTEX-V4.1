import { defineConfig } from 'vitest/config'

// Dedicated Vitest config so the unit tests for the generative core run in a
// plain Node environment without pulling in the app's React/Tailwind Vite
// plugins (which are irrelevant to pure-logic tests and slow to load).
export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
})

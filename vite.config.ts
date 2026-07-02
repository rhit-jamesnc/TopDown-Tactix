import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },

    projects: [
      'client/vite.config.ts', // Frontend React environment

      {
        // Backend Node environment definition
        test: {
          name: 'backend-and-shared',
          environment: 'node',
          include: [
            'shared/tests/**/*.test.js',
            'server/tests/**/*.test.js',
            'server/**/*.test.js'
          ]
        }
      }
    ]
  }
})
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['visual-tests/**', '**/visual-tests/**', '**/node_modules/**', '**/dist/**'],
  },
});

import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './visual-tests',
  snapshotPathTemplate: '{testDir}/__snapshots__/{arg}',
  webServer: {
    command: 'pnpm storybook',
    url: 'http://127.0.0.1:6006',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  use: {
    headless: true,
  },
});

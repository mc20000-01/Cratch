import { test, expect } from '@playwright/test';

const stories = [
  'primitives-button--default',
  'primitives-button--loading',
  'primitives-button--empty',
  'primitives-button--error',
  'primitives-button--success',
  'primitives-button--disabled',
  'composites-statepanel--default',
  'composites-statepanel--loading',
  'composites-statepanel--empty',
  'composites-statepanel--error',
  'composites-statepanel--success',
];

for (const storyId of stories) {
  test(storyId, async ({ page }) => {
    await page.goto(`http://127.0.0.1:6006/iframe.html?id=${storyId}`);
    await page.setViewportSize({ width: 900, height: 600 });
    await expect(page).toHaveScreenshot(`${storyId}.png`, { fullPage: true });
  });
}

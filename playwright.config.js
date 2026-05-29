// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './scripts/tests',
  timeout: 30000,
  retries: 1,
  workers: 4,
  reporter: [
    ['html', { outputFolder: 'scripts/tests/reports', open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: 'https://appadaycreator.github.io',
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 5'] },
    },
  ],
});

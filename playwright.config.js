// @ts-check
const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config();

/**
 * Playwright configuration for Beeceptor HTTP Callout Rule automation.
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }], ['list']],

  /* Global settings (NO storageState here — handled per-project) */
  use: {
    baseURL: 'https://app.beeceptor.com',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on',
    viewport: { width: 1280, height: 800 },
  },

  projects: [
    /* 1. Setup: login & save session. Must NOT have storageState. */
    {
      name: 'setup',
      testMatch: /.*\.setup\.js/,
      // No storageState — this project CREATES the auth file
    },

    /* 2. Main tests: use the saved session from setup. */
    {
      name: 'beeceptor-tests',
      testMatch: /.*\.spec\.js/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
});

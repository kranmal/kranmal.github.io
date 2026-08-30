import { defineConfig, devices } from '@playwright/test';

/* Accessibility checks for this site, per
   https://playwright.dev/docs/accessibility-testing

   Runs against a local static server by default, so the suite tests the
   working tree rather than whatever is currently deployed. Point it at
   production with:  BASE_URL=https://kranmal.github.io npx playwright test */
const baseURL = process.env.BASE_URL ?? 'http://127.0.0.1:4173';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: 'npx --yes http-server . -p 4173 -s',
        url: 'http://127.0.0.1:4173',
        reuseExistingServer: !process.env.CI,
      },
});

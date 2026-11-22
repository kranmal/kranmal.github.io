import { test, expect } from '@playwright/test';

/* Every page carries a Content-Security-Policy <meta> whose inline-script
   allowances are SHA-256 hashes. Editing an inline <script> changes its hash
   and the browser then blocks it silently, so load each page and fail on any
   violation raised by our own origin. (frame-ancestors cannot be set from a
   <meta>, so clickjacking protection stays out of scope here.) */

const PAGES = [
  '/', '/privacy.html',
  '/claude-usage-monitor/', '/cryptomon/', '/linux-keepawake/', '/linux-powermon/',
  '/linux-speedtest/', '/pollar-ticker/', '/sysmon/', '/vacuumtube-macos/',
];

for (const path of PAGES) {
  test(`CSP: ${path} has a policy and breaks nothing`, async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).__csp = [];
      document.addEventListener('securitypolicyviolation', e =>
        (window as any).__csp.push(`${e.violatedDirective} blocked ${e.blockedURI || 'inline'}`));
    });
    await page.goto(path);
    await page.waitForLoadState('networkidle');

    const policy = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
    expect(policy, 'no CSP meta tag').toBeTruthy();
    expect(policy).not.toMatch(/script-src[^;]*'unsafe-inline'/);

    // third-party analytics may be unreachable from a test runner; that is a network error, not a CSP one
    const violations: string[] = await page.evaluate(() => (window as any).__csp);
    expect(violations).toEqual([]);
  });
}

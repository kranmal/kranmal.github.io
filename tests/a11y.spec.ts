import { test, expect } from './axe-test';
import AxeBuilder from '@axe-core/playwright';
import type { Page, TestInfo } from '@playwright/test';
// Cards and tracklist rows fade in via IntersectionObserver
// (`.reveal` -> `.is-in`), staggered by `transition-delay: var(--i) * 45ms`
// on a 550ms opacity transition. Adding `.is-in` only STARTS that fade, so
// waiting on the class alone makes axe sample half-transparent text and
// report contrast failures that the settled page does not have. Wait for
// computed opacity to actually reach 1 on every revealed element.
async function settle(page: Page) {
  await page.goto('/');
  await page.waitForLoadState('load');
  const reveals = page.locator('.reveal');
  const count = await reveals.count();
  for (let i = 0; i < count; i++) await reveals.nth(i).scrollIntoViewIfNeeded();
  await page.waitForFunction(
    () =>
      [...document.querySelectorAll('.reveal')].every(
        el => parseFloat(getComputedStyle(el).opacity) === 1,
      ),
    null,
    { timeout: 15000 },
  );
  await page.evaluate(() => window.scrollTo(0, 0));
}

async function attach(testInfo: TestInfo, name: string, results: unknown) {
  await testInfo.attach(name, {
    body: JSON.stringify(results, null, 2),
    contentType: 'application/json',
  });
}

test.describe('kranmal.github.io homepage', () => {
  test('should not have any automatically detectable accessibility issues', async ({ page }, testInfo) => {
    await settle(page);
    const results = await new AxeBuilder({ page }).analyze();
    await attach(testInfo, 'axe-full-scan.json', results);
    expect(results.violations).toEqual([]);
  });

  test('should not have any automatically detectable WCAG A or AA violations', async ({ page, makeAxeBuilder }, testInfo) => {
    await settle(page);
    const results = await makeAxeBuilder().analyze();
    await attach(testInfo, 'axe-wcag-scan.json', results);
    expect(results.violations).toEqual([]);
  });

  test('header should not have automatically detectable accessibility violations', async ({ page, makeAxeBuilder }, testInfo) => {
    await settle(page);
    const results = await makeAxeBuilder().include('header.topbar').analyze();
    await attach(testInfo, 'axe-header-scan.json', results);
    expect(results.violations).toEqual([]);
  });

  test('project list should not have automatically detectable accessibility violations', async ({ page, makeAxeBuilder }, testInfo) => {
    await settle(page);
    const results = await makeAxeBuilder().include('section.side').analyze();
    await attach(testInfo, 'axe-projects-scan.json', results);
    expect(results.violations).toEqual([]);
  });

  test('dark theme should not have automatically detectable accessibility violations', async ({ page, makeAxeBuilder }, testInfo) => {
    await settle(page);
    // Toggle until the document is explicitly in dark mode, whichever way it started.
    const toggle = page.getByRole('button', { name: 'Toggle theme' });
    for (let i = 0; i < 2; i++) {
      if ((await page.locator('html').getAttribute('data-theme')) === 'dark') break;
      await toggle.click();
    }
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const results = await makeAxeBuilder().analyze();
    await attach(testInfo, 'axe-dark-scan.json', results);
    expect(results.violations).toEqual([]);
  });

  test('light theme should not have automatically detectable accessibility violations', async ({ page, makeAxeBuilder }, testInfo) => {
    await settle(page);
    const toggle = page.getByRole('button', { name: 'Toggle theme' });
    for (let i = 0; i < 2; i++) {
      if ((await page.locator('html').getAttribute('data-theme')) === 'light') break;
      await toggle.click();
    }
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    const results = await makeAxeBuilder().analyze();
    await attach(testInfo, 'axe-light-scan.json', results);
    expect(results.violations).toEqual([]);
  });
});

test.describe('privacy page', () => {
  test('should not have any automatically detectable WCAG A or AA violations', async ({ page, makeAxeBuilder }, testInfo) => {
    await page.goto('/privacy.html');
    const results = await makeAxeBuilder().analyze();
    await attach(testInfo, 'axe-privacy-scan.json', results);
    expect(results.violations).toEqual([]);
  });

  test('dark theme should not have automatically detectable WCAG A or AA violations', async ({ page, makeAxeBuilder }, testInfo) => {
    await page.goto('/privacy.html');
    const toggle = page.getByRole('button', { name: /theme/i });
    for (let i = 0; i < 2; i++) {
      if ((await page.locator('html').getAttribute('data-theme')) === 'dark') break;
      await toggle.click();
    }
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const results = await makeAxeBuilder().analyze();
    await attach(testInfo, 'axe-privacy-dark-scan.json', results);
    expect(results.violations).toEqual([]);
  });
});

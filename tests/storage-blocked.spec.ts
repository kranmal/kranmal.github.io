import { test, expect } from '@playwright/test';

/* a browser with site data blocked throws on localStorage access; the theme
   toggle must still work, it just can't remember the choice */
test('theme toggle survives a localStorage that throws', async ({ page }) => {
  await page.addInitScript(() => {
    const boom = () => { throw new DOMException('denied', 'SecurityError'); };
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() { return { getItem: boom, setItem: boom, removeItem: boom }; },
    });
  });

  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');

  const before = await page.evaluate(() =>
    matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  await page.getByRole('button', { name: 'Toggle theme' }).click();
  await expect(page.locator('html')).toHaveAttribute(
    'data-theme', before === 'dark' ? 'light' : 'dark');

  // the rest of the IIFE must still have run
  await expect(page.locator('#count')).not.toHaveText('');
  expect(errors).toEqual([]);
});

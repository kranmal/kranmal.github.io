import { test, expect } from '@playwright/test';

const KEY = 'kranmal-theme';
const PAGES = ['/', '/privacy.html'];

for (const path of PAGES) {
  test.describe(`theme on ${path}`, () => {
    /* a browser with site data blocked throws on localStorage access; the
       theme toggle must still work, it just can't remember the choice */
    test('toggle survives a localStorage that throws', async ({ page }) => {
      await page.addInitScript(() => {
        const boom = () => { throw new DOMException('denied', 'SecurityError'); };
        Object.defineProperty(window, 'localStorage', {
          configurable: true,
          get() { return { getItem: boom, setItem: boom, removeItem: boom }; },
        });
      });

      const errors: string[] = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.goto(path);

      const before = await page.evaluate(() =>
        matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

      await page.getByRole('button', { name: 'Toggle theme' }).click();
      await expect(page.locator('html')).toHaveAttribute(
        'data-theme', before === 'dark' ? 'light' : 'dark');

      // the rest of the homepage script must still have run
      if (path === '/') await expect(page.locator('#count')).not.toHaveText('');
      expect(errors).toEqual([]);
    });

    /* the saved choice must be on <html> before <body> exists, or the
       page paints in the OS theme first and then flips */
    test('saved theme applies before the body is parsed', async ({ page }) => {
      await page.addInitScript(key => {
        localStorage.setItem(key, 'dark');
        new MutationObserver((_, obs) => {
          if (!document.body) return;
          (window as any).__themeAtBody = document.documentElement.getAttribute('data-theme');
          obs.disconnect();
        }).observe(document, { childList: true, subtree: true });
      }, KEY);
      await page.goto(path);
      expect(await page.evaluate(() => (window as any).__themeAtBody)).toBe('dark');
    });

    test('a junk saved value is ignored', async ({ page }) => {
      await page.addInitScript(key => localStorage.setItem(key, 'purple'), KEY);
      await page.goto(path);
      await expect(page.locator('html')).not.toHaveAttribute('data-theme', /./);
    });

    test('browser chrome tint follows the chosen theme', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' });
      await page.goto(path);
      const metas = page.locator('meta[name="theme-color"]');
      const darkTint = await page
        .locator('meta[name="theme-color"][media*="dark"]')
        .getAttribute('content');

      await page.getByRole('button', { name: 'Toggle theme' }).click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      for (const content of await metas.evaluateAll(ms => ms.map(m => (m as HTMLMetaElement).content)))
        expect(content).toBe(darkTint);
    });
  });
}

test('the choice carries across pages', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Toggle theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.getByRole('link', { name: 'Privacy policy' }).click();
  await expect(page).toHaveURL(/privacy\.html$/);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

import { test as base, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

type AxeFixture = {
  makeAxeBuilder: () => AxeBuilder;
};

/* Shared axe configuration, per the guide's "test fixtures" pattern. */
export const test = base.extend<AxeFixture>({
  makeAxeBuilder: async ({ page }, use) => {
    const makeAxeBuilder = () =>
      new AxeBuilder({ page }).withTags([
        'wcag2a',
        'wcag2aa',
        'wcag21a',
        'wcag21aa',
      ]);
    await use(makeAxeBuilder);
  },
});

export { expect };

/* Click the theme toggle until the document is explicitly in `theme`,
   whichever way it started (the first click may only leave the OS theme). */
export async function setTheme(page: Page, theme: 'light' | 'dark') {
  const html = page.locator('html');
  const toggle = page.getByRole('button', { name: 'Toggle theme' });
  for (let i = 0; i < 2; i++) {
    if ((await html.getAttribute('data-theme')) === theme) break;
    await toggle.click();
  }
  await expect(html).toHaveAttribute('data-theme', theme);
}

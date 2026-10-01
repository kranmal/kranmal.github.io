import { test, expect } from '@playwright/test';

/* Adding a project means touching the card or tracklist row, the ItemList
   JSON-LD, the sitemap and the "N side projects" count. These have drifted
   apart before, so check they all name the same set of projects. */

const SITE = 'https://kranmal.github.io/';

test.describe('project list stays in sync', () => {
  let projects: string[];

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    projects = await page
      .locator('a.feature, a.track')
      .evaluateAll(as => as.map(a => (a as HTMLAnchorElement).href));
  });

  test('every project is linked once', () => {
    expect(projects.length).toBeGreaterThan(0);
    expect(new Set(projects).size).toBe(projects.length);
  });

  test('the static project count matches the list', async ({ request }) => {
    // read the raw HTML: the script corrects #count at runtime, but crawlers
    // and no-JS visitors see the number written in the markup
    const html = await (await request.get('/')).text();
    const written = html.match(/<span id="count">(\d+)<\/span>/)?.[1];
    expect(Number(written)).toBe(projects.length);
  });

  test('the ItemList structured data lists the same projects, in order', async ({ page }) => {
    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll(ss => ss.map(s => JSON.parse(s.textContent || '')));
    const list = blocks.find(b => b['@type'] === 'ItemList');
    expect(list).toBeTruthy();
    const items = list.itemListElement as { position: number; url: string }[];
    expect(items.map(i => i.url)).toEqual(projects);
    expect(items.map(i => i.position)).toEqual(projects.map((_, i) => i + 1));
  });

  test('the sitemap lists every project, the hub and the privacy page', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    expect(new Set(locs).size).toBe(locs.length);
    expect(locs.sort()).toEqual([SITE, `${SITE}privacy.html`, ...projects].sort());
  });
});

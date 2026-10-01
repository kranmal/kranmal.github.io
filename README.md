# kranmal.github.io

Root GitHub Pages site for this account: a single hand-written hub page
linking out to the projects, most of which live in
[Vibe_Portfolio_Projects](https://github.com/kranmal/Vibe_Portfolio_Projects).
No build step: what's in the repo is what's served.

| File | What it is |
| --- | --- |
| `index.html` | The hub. Styles and page script are inline. |
| `privacy.html` | Privacy policy covering every project on the domain. |
| `theme.js` | Shared light/dark toggle, loaded in `<head>` by both pages. |
| `sitemap.xml`, `robots.txt`, `og-image.png` | Search and social metadata. |

## Adding a project

A new project touches four places, and `tests/content.spec.ts` fails
until they agree:

1. a `.feature` card (A-side) or a `.track` row (Deep cuts) in `index.html`
2. a matching entry, in the same order, in the `ItemList` JSON-LD
3. the `<span id="count">` number in the kicker (the script corrects it at
   runtime, but crawlers and no-JS visitors see the written one)
4. a `<url>` in `sitemap.xml`

## Tests

```sh
npm ci
npx playwright install chromium
npm test            # against the working tree, via a local static server
npm run test:prod   # against the live site
```

The suite runs axe accessibility scans in both themes, checks the theme
toggle (including with storage blocked), and checks the project list is
consistent. CI runs it on every push and pull request.

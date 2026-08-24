# kranmal.github.io

Root GitHub Pages site for this account. Exists mainly so
`kranmal.github.io` (the domain root) serves real content instead of a
404 — needed for:

- **AdSense site verification** — the AdSense snippet lives in this
  page's `<head>`, so Google's crawler finds it at the domain root.
- **`ads.txt`** — ad networks crawl `ads.txt` at the domain root, not at
  a project page's subpath. This repo's `ads.txt` is what
  `https://kranmal.github.io/ads.txt` actually serves.

The page itself is a minimal index linking out to the real projects,
which live in [Vibe_Portfolio_Projects](https://github.com/kranmal/Vibe_Portfolio_Projects)
(`cot-dashboard`, `crypto-portfolio`).

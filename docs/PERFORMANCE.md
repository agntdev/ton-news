# Ton News performance and mobile checks

Ton News keeps the first page load small by using server components, system
fonts, static metadata, and cacheable static assets.

## Implemented optimizations

- Long-lived immutable caching for hashed JavaScript, CSS, font, and image
  assets.
- DNS prefetch enabled for route responses.
- Explicit viewport and theme-color metadata for mobile browsers.
- Responsive header layout that stacks on narrow screens and scrolls the nav
  horizontally instead of squeezing text.
- Article cards use stable minimum height and `content-visibility: auto` so long
  lists are cheaper to render below the fold.
- Mobile spacing on the home and article index pages is reduced to keep primary
  content visible earlier.

## Verification

Run these checks before release:

```bash
npm run typecheck
npm run lint
NEXT_TELEMETRY_DISABLED=1 npm run build
```

Manual mobile checks:

- 320px width: header brand and nav remain usable without overlapping.
- 375px width: hero copy and buttons wrap cleanly.
- Article index: cards keep stable spacing while scrolling.
- Article detail: body text remains readable without horizontal scrolling.

## Performance budget

- Keep shared first-load JavaScript under 100 kB.
- Avoid client components unless a route needs browser APIs.
- Prefer system fonts or preloaded local fonts over external font requests.
- Use AVIF/WebP for future article images and provide responsive sizes.

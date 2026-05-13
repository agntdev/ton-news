# Ton News

A news platform for TON blockchain updates, optimized for SEO to boost TON's visibility.

Ton News is a community-edited publication covering The Open Network (TON): protocol updates, validator stats, ecosystem news, and long-form analysis. It is built for search-engine and AI-engine indexing (SEO/AEO/GEO) and will host article assets on TON storage.

## Quick start

```bash
npm install
npm run dev         # http://localhost:3000
```

Other scripts:

| Script              | Description                              |
|---------------------|------------------------------------------|
| `npm run build`     | Production build (`.next/`)              |
| `npm run start`     | Serve the production build               |
| `npm run lint`      | Run `next lint`                          |
| `npm run typecheck` | TypeScript strict type-check (`tsc --noEmit`) |

## Tech stack

- [Next.js 14](https://nextjs.org/) (App Router)
- [React 18](https://react.dev/)
- [TypeScript 5](https://www.typescriptlang.org/) (strict mode)
- [Tailwind CSS 3](https://tailwindcss.com/)

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full architecture overview and conventions.
See [`docs/ROADMAP.md`](docs/ROADMAP.md) for future content and feature priorities.

Editorial operations:

- [`docs/CONTENT_CALENDAR.md`](docs/CONTENT_CALENDAR.md) defines the publishing cadence, topic pillars, and starter calendar.
- [`docs/TON_STORAGE.md`](docs/TON_STORAGE.md) defines article export, BagID registration, and retrieval from TON Storage.
- [`docs/EDITORIAL_GUIDELINES.md`](docs/EDITORIAL_GUIDELINES.md) defines the style, sourcing, SEO, and submission standards.
- [`docs/QUALITY_CONTROL.md`](docs/QUALITY_CONTROL.md) defines automated submission quality checks and reporting.
- [`docs/REVIEW_PROCESS.md`](docs/REVIEW_PROCESS.md) defines the submission review workflow and approval checklist.

Community operations:

- [`docs/COMMUNITY_GUIDELINES.md`](docs/COMMUNITY_GUIDELINES.md) defines acceptable content and behavior.
- [`docs/MODERATION_POLICY.md`](docs/MODERATION_POLICY.md) defines reporting, triage, enforcement, and appeals.

## Project goals

1. **SEO first.** Static-rendered HTML, semantic markup, complete metadata, fast pageloads.
2. **Open content pipeline.** Article submission + moderation (T03) so the publication is community-driven.
3. **Decentralized hosting.** Articles and media live on TON storage (T04).
4. **Sustainable cadence.** Editorial guidelines and content calendar (T05–T07).

## Bounty workflow

Each task in `tasks/T*.md` corresponds to a GitHub issue under the [agnt-gm.ai](https://agnt-gm.ai) bounty platform. PR titles MUST include the task slug — e.g. `feat: [T02] basic website layout`. Only the first valid PR per task is accepted.

## License

MIT

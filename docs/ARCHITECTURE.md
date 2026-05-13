# Ton News architecture

## Stack

- **Framework:** Next.js 14 (App Router) — SSR/SSG for SEO; React Server Components by default.
- **Language:** TypeScript (strict).
- **Styles:** Tailwind CSS.
- **Hosting target:** Static export to Vercel/Netlify or TON Storage (`NEXT_OUTPUT=export npm run build`).

## Why Next.js

The project's stated goal is SEO ranking. Next.js gives us:

- Server-rendered HTML at request time (or pre-rendered at build time) — critical for crawler indexing.
- Built-in `<metadata>` API for per-page `<title>`, `description`, OpenGraph, Twitter cards, and canonical URLs.
- App Router co-locates server data fetching with routes, keeping the SEO surface (HTML response) heavy on content and light on client JS.

## Directory layout

```
src/
  app/
    layout.tsx           Root <html>/<body> + global metadata
    globals.css          Tailwind layers + base styles
    page.tsx             Home page (force-static)
  lib/
    articles.ts          Article type + in-memory sample data
public/                  Static assets (favicon, robots.txt, sitemap.xml)
docs/                    Project docs
tasks/                   Bounty task specs (T01.md … T16.md)
```

## Editorial operations

- [`CONTENT_CALENDAR.md`](CONTENT_CALENDAR.md) defines the weekly publishing
  rhythm, topic pillars, starter calendar, and article brief template.
- [`TON_STORAGE.md`](TON_STORAGE.md) defines article export, BagID
  registration, and gateway retrieval from TON Storage.
- [`CONTENT_AUTOMATION.md`](CONTENT_AUTOMATION.md) defines scheduled publishing,
  content backups, and recovery commands.
- [`EDITORIAL_GUIDELINES.md`](EDITORIAL_GUIDELINES.md) defines style,
  sourcing, SEO, and submission standards.
- [`QUALITY_CONTROL.md`](QUALITY_CONTROL.md) defines automated submission
  quality checks, scoring, and moderation queue reporting.
- [`REVIEW_PROCESS.md`](REVIEW_PROCESS.md) defines roles, moderation steps,
  review criteria, and decision notes.

## Community operations

- [`COMMUNITY_GUIDELINES.md`](COMMUNITY_GUIDELINES.md) defines acceptable
  content, expected behavior, prohibited content, and enforcement actions.
- [`MODERATION_POLICY.md`](MODERATION_POLICY.md) defines report intake, triage,
  moderation workflow, appeals, and moderator note templates.

## Roadmap

[`ROADMAP.md`](ROADMAP.md) tracks current gaps, 30/60/90-day priorities,
success metrics, and the review cadence for future content and feature work.

## Conventions

- **Pages:** Server components by default. Mark client components with `'use client'`.
- **Data:** Currently in-memory (`src/lib/articles.ts`). Will migrate to a content collection + TON storage in later tasks (T04).
- **Styling:** Utility-first Tailwind; reusable patterns extracted into components, not custom CSS classes.
- **Metadata:** Each route exports a `metadata` object or a `generateMetadata` function. The root layout sets defaults; per-page metadata is merged.

## Local development

```bash
npm install
npm run dev         # http://localhost:3000
npm run typecheck   # strict TS check
npm run lint        # next lint
npm run build       # production build
```

## Roadmap of bounty tasks

See [`plan.md`](../plan.md). Phases:

1. **Platform development (T01–T04).** Scaffold, layout, submission/moderation, TON storage.
2. **Content creation (T05–T07).** Initial articles + editorial guidelines.
3. **SEO optimization (T08–T10).** Best practices + analytics + perf.
4. **Community (T11–T13).** Social sharing + comments + guidelines.
5. **Maintenance (T14–T16).** Automation, metrics, future roadmap.

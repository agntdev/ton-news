# Ton News SEO reporting

Ton News includes a local SEO reporting command for editorial and release
checks.

## Run the report

```bash
npm run seo:report
```

The command scans bundled articles and writes `reports/seo-report.json`.

## Metrics

Each article receives a score from 0 to 100 based on:

- Title length
- Excerpt length
- Body depth
- Tag coverage
- TON keyword coverage in the title
- Canonical slug format

The report includes article-level alerts plus an aggregate article count,
average score, and alert count.

## Alerts

Editors should treat alerts as review prompts. A low score does not always mean
an article is wrong, but it flags content that may need better metadata,
clearer targeting, or more depth before publication.

## Automation

Recommended release check:

```bash
npm run seo:report
npm run typecheck
npm run lint
npm run build
```

Keep `reports/seo-report.json` out of source control when it contains local
draft analysis.

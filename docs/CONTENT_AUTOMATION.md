# Ton News content automation and backups

Ton News includes local scripts for scheduled content publishing, backups, and
recovery. They are designed to run from cron, GitHub Actions, or a deployment
job without requiring a moderator to click through the app.

## Scheduled content updates

Scheduled articles live in `data/content-schedule.json`. The file is ignored by
git because local teams may use private drafts.

Example:

```json
[
  {
    "slug": "ton-validator-roundup",
    "title": "TON Validator Roundup",
    "excerpt": "A weekly summary of validator updates and network operations.",
    "body": "Article body...",
    "author": "ton-news-team",
    "tags": ["validators", "network"],
    "publishAt": "2026-05-20T09:00:00.000Z"
  }
]
```

Run due publishing:

```bash
npm run content:publish-due
```

The script validates each due item, appends it to `data/articles.json`, and
marks the schedule item as published. Published scheduled articles are loaded by
the normal article index and article detail routes.

## Backups

Create a timestamped content backup:

```bash
npm run content:backup
```

Backups are written to `backups/content-<timestamp>.json` and include:

- `data/articles.json`
- `data/submissions.json`
- `data/comments.json`
- `data/users.json`

The backup directory is ignored by git to avoid committing local user records or
drafts.

## Recovery

Restore a backup:

```bash
npm run content:restore -- --file backups/content-20260520T090000Z.json
```

The restore command writes only known content data files and rejects unsupported
backup formats. Run `npm run content:backup` before scheduled maintenance or
schema changes so the site can be recovered quickly.

## Automation example

A daily cron or scheduled GitHub Action can run:

```bash
npm install
npm run content:backup
npm run content:publish-due
npm run build
```

This keeps the published article feed current while preserving a recovery point
before any automated update is applied.

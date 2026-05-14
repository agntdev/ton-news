# Ton News analytics

Ton News tracks privacy-friendly page-view events for SEO reporting and content
planning. The tracker does not use cookies or persistent visitor identifiers.

## Tracking

`AnalyticsTracker` runs in the root layout and sends a `page_view` event to
`/api/analytics` whenever the route changes. Events include:

- Path
- Referrer hostname, when available
- User agent, truncated for debugging
- Timestamp

Events are skipped when the browser advertises `Do Not Track`.

## Storage

Events are stored in `data/analytics-events.json`, which is ignored by git.
Records older than 90 days are pruned when new page views are recorded.

## Dashboard

Moderators can open `/analytics` to review:

- Total page views
- Unique paths
- Top pages
- Top referrers
- Recent events
- SEO alerts

SEO alerts currently flag missing tracking data, low article inventory, article
pages without tracked views, and published articles without tags.

## Operations

For production deployments, include `data/analytics-events.json` in regular
content backups. Use the analytics page to identify pages that need internal
links, title improvements, or additional coverage in the content calendar.

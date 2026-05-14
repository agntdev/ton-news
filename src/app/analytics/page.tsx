import type { Metadata } from 'next'
import { requireRole } from '@/lib/auth'
import { getAnalyticsSummary } from '@/lib/analytics'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Analytics',
  robots: { index: false, follow: false },
}

export default async function AnalyticsPage() {
  const moderator = await requireRole('moderator')
  const summary = await getAnalyticsSummary()

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-2 text-sm text-ink-500">
          Signed in as <strong>{moderator.username}</strong>. Tracks privacy-friendly page views and SEO health signals.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Page views" value={summary.totalPageViews} />
        <MetricCard label="Unique paths" value={summary.uniquePaths} />
        <MetricCard label="SEO alerts" value={summary.seoAlerts.length} />
      </section>

      {summary.seoAlerts.length > 0 ? (
        <section className="mt-8 rounded-md border border-amber-200 bg-amber-50 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-900">
            Alerts
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-amber-900">
            {summary.seoAlerts.map((alert) => (
              <li key={alert}>{alert}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <TableCard title="Top pages" empty="No page views recorded." isEmpty={summary.topPages.length === 0}>
          {summary.topPages.map((row) => (
            <MetricRow key={row.path} label={row.path} value={row.views} />
          ))}
        </TableCard>
        <TableCard title="Top referrers" empty="No referrers recorded." isEmpty={summary.topReferrers.length === 0}>
          {summary.topReferrers.map((row) => (
            <MetricRow key={row.referrer} label={row.referrer} value={row.views} />
          ))}
        </TableCard>
      </section>

      <section className="mt-8 rounded-md border border-ink-100 bg-white p-5">
        <h2 className="text-lg font-semibold text-ink-900">Recent events</h2>
        {summary.recentEvents.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">No analytics events recorded.</p>
        ) : (
          <ul className="mt-4 divide-y divide-ink-100 text-sm">
            {summary.recentEvents.map((event) => (
              <li key={event.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span className="font-medium text-ink-900">{event.path}</span>
                <span className="text-ink-500">{new Date(event.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-ink-100 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-ink-900">{value}</p>
    </div>
  )
}

function TableCard({
  title,
  empty,
  isEmpty,
  children,
}: {
  title: string
  empty: string
  isEmpty: boolean
  children: React.ReactNode
}) {
  return (
    <div className="rounded-md border border-ink-100 bg-white p-5">
      <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
      <div className="mt-4 space-y-3 text-sm">
        {isEmpty ? <p className="text-ink-500">{empty}</p> : children}
      </div>
    </div>
  )
}

function MetricRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="truncate text-ink-700">{label}</span>
      <span className="font-semibold text-ink-900">{value}</span>
    </div>
  )
}

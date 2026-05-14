import type { Metadata } from 'next'
import Link from 'next/link'
import { listPublishedArticles } from '@/lib/articles'
import { buildSeoDashboardMetrics, type SeoAlertSeverity } from '@/lib/seo-reporting'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'SEO metrics',
  robots: { index: false, follow: false },
}

const metricCards = [
  { key: 'articleCount', label: 'Articles' },
  { key: 'averageScore', label: 'Average score' },
  { key: 'alertCount', label: 'Open alerts' },
  { key: 'criticalAlertCount', label: 'Critical alerts' },
] as const

const severityClasses: Record<SeoAlertSeverity, string> = {
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  critical: 'border-red-200 bg-red-50 text-red-700',
}

function statusForScore(score: number, alertCount: number) {
  if (score < 70) return { label: 'Critical', className: 'border-red-200 bg-red-50 text-red-700' }
  if (alertCount > 0) return { label: 'Watch', className: 'border-amber-200 bg-amber-50 text-amber-800' }
  return { label: 'Healthy', className: 'border-emerald-200 bg-emerald-50 text-emerald-800' }
}

export default async function SeoMetricsPage() {
  const articles = await listPublishedArticles()
  const metrics = buildSeoDashboardMetrics(articles)

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink-900">SEO metrics</h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-500">
            Article-level search readiness, keyword coverage, and editorial alerts for the current published catalog.
          </p>
        </div>
        <time className="text-xs text-ink-500" dateTime={metrics.generatedAt}>
          Updated {new Date(metrics.generatedAt).toLocaleString()}
        </time>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="SEO summary">
        {metricCards.map((card) => (
          <div key={card.key} className="rounded-md border border-ink-100 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold text-ink-900">{metrics[card.key]}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-md border border-ink-100 bg-white p-4">
        <h2 className="text-sm font-semibold text-ink-900">Alert distribution</h2>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          <p className="rounded-md bg-emerald-50 px-3 py-2 text-emerald-800">
            Healthy: {metrics.healthyArticleCount}
          </p>
          <p className="rounded-md bg-amber-50 px-3 py-2 text-amber-800">
            Watch: {metrics.watchArticleCount}
          </p>
          <p className="rounded-md bg-red-50 px-3 py-2 text-red-700">
            Critical: {metrics.criticalArticleCount}
          </p>
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">Article dashboard</h2>
          <Link href="/articles" className="text-sm font-medium text-brand hover:text-brand-dark">
            View articles
          </Link>
        </div>

        <div className="mt-3 overflow-hidden rounded-md border border-ink-100 bg-white">
          <div className="grid grid-cols-[1.4fr_0.5fr_0.5fr_0.5fr_0.6fr] gap-3 border-b border-ink-100 bg-ink-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
            <span>Article</span>
            <span>Score</span>
            <span>Title</span>
            <span>Body</span>
            <span>Status</span>
          </div>
          <ul className="divide-y divide-ink-100">
            {metrics.articles.map((article) => {
              const status = statusForScore(article.score, article.alerts.length)

              return (
                <li key={article.slug} className="px-4 py-4">
                  <div className="grid gap-3 sm:grid-cols-[1.4fr_0.5fr_0.5fr_0.5fr_0.6fr] sm:items-center">
                    <Link href={`/articles/${article.slug}`} className="font-medium text-ink-900 hover:text-brand">
                      {article.title}
                    </Link>
                    <span className="text-sm text-ink-700">{article.score}/100</span>
                    <span className="text-sm text-ink-500">{article.titleLength} chars</span>
                    <span className="text-sm text-ink-500">{article.bodyLength} chars</span>
                    <span className={`w-fit rounded-full border px-2 py-1 text-xs font-semibold ${status.className}`}>
                      {status.label}
                    </span>
                  </div>

                  {article.alerts.length > 0 ? (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {article.alerts.map((alert) => (
                        <li
                          key={alert.code}
                          className={`rounded-full border px-2 py-1 text-xs ${severityClasses[alert.severity]}`}
                        >
                          {alert.message}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </div>
      </section>
    </div>
  )
}

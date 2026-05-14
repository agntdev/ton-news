import { promises as fs } from 'node:fs'
import path from 'node:path'
import { listPublishedArticles } from './articles'

export interface AnalyticsEvent {
  id: string
  name: 'page_view'
  path: string
  referrer?: string
  userAgent?: string
  createdAt: string
}

export interface AnalyticsSummary {
  totalPageViews: number
  uniquePaths: number
  topPages: Array<{ path: string; views: number }>
  topReferrers: Array<{ referrer: string; views: number }>
  recentEvents: AnalyticsEvent[]
  seoAlerts: string[]
}

const ANALYTICS_FILE = path.join(process.cwd(), 'data', 'analytics-events.json')
const MAX_EVENT_AGE_DAYS = 90

async function readEvents(): Promise<AnalyticsEvent[]> {
  try {
    const raw = await fs.readFile(ANALYTICS_FILE, 'utf8')
    return JSON.parse(raw) as AnalyticsEvent[]
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw error
  }
}

async function writeEvents(events: AnalyticsEvent[]): Promise<void> {
  await fs.mkdir(path.dirname(ANALYTICS_FILE), { recursive: true })
  await fs.writeFile(ANALYTICS_FILE, JSON.stringify(events, null, 2) + '\n', 'utf8')
}

export async function recordPageView(input: {
  path: string
  referrer?: string
  userAgent?: string
}): Promise<void> {
  const pathName = normalizePath(input.path)
  if (!pathName) return

  const cutoff = Date.now() - MAX_EVENT_AGE_DAYS * 24 * 60 * 60 * 1000
  const existing = (await readEvents()).filter((event) => {
    return new Date(event.createdAt).getTime() >= cutoff
  })
  existing.push({
    id: `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    name: 'page_view',
    path: pathName,
    referrer: normalizeReferrer(input.referrer),
    userAgent: input.userAgent?.slice(0, 200),
    createdAt: new Date().toISOString(),
  })
  await writeEvents(existing)
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const events = await readEvents()
  const pageViews = events.filter((event) => event.name === 'page_view')
  const topPages = topCounts(pageViews.map((event) => event.path), 10).map(([path, views]) => ({
    path,
    views,
  }))
  const topReferrers = topCounts(
    pageViews.map((event) => event.referrer ?? 'Direct / unknown'),
    10,
  ).map(([referrer, views]) => ({ referrer, views }))

  return {
    totalPageViews: pageViews.length,
    uniquePaths: new Set(pageViews.map((event) => event.path)).size,
    topPages,
    topReferrers,
    recentEvents: [...pageViews]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 10),
    seoAlerts: await getSeoAlerts(pageViews),
  }
}

async function getSeoAlerts(pageViews: AnalyticsEvent[]): Promise<string[]> {
  const alerts: string[] = []
  const articles = await listPublishedArticles()
  if (articles.length < 5) {
    alerts.push('Publish at least five articles to build a useful SEO baseline.')
  }
  if (pageViews.length === 0) {
    alerts.push('No page views recorded yet. Confirm analytics tracking is active in production.')
  }
  const articleViews = pageViews.filter((event) => event.path.startsWith('/articles/')).length
  if (pageViews.length > 0 && articleViews === 0) {
    alerts.push('Article pages have not received tracked views yet.')
  }
  const thinTags = articles.filter((article) => article.tags.length === 0)
  if (thinTags.length > 0) {
    alerts.push(`${thinTags.length} published articles are missing topic tags.`)
  }
  return alerts
}

function normalizePath(value: string): string | null {
  try {
    const url = value.startsWith('http') ? new URL(value) : new URL(value, 'https://ton-news.local')
    if (!url.pathname.startsWith('/')) return null
    return url.pathname.slice(0, 160)
  } catch {
    return null
  }
}

function normalizeReferrer(value?: string): string | undefined {
  if (!value) return undefined
  try {
    const url = new URL(value)
    return url.hostname.slice(0, 120)
  } catch {
    return undefined
  }
}

function topCounts(values: string[], limit: number): Array<[string, number]> {
  const counts = new Map<string, number>()
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit)
}

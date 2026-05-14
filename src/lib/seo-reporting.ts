import type { Article } from './articles'

const TITLE_MIN = 35
const TITLE_MAX = 70
const EXCERPT_MIN = 80
const EXCERPT_MAX = 180
const BODY_MIN = 600
const TON_KEYWORD = 'ton'

export type SeoAlertSeverity = 'warning' | 'critical'

export interface SeoAlert {
  code: string
  message: string
  severity: SeoAlertSeverity
}

export interface ArticleSeoMetric {
  slug: string
  title: string
  score: number
  titleLength: number
  excerptLength: number
  bodyLength: number
  tagCount: number
  alerts: SeoAlert[]
}

export interface SeoDashboardMetrics {
  generatedAt: string
  articleCount: number
  averageScore: number
  alertCount: number
  criticalAlertCount: number
  healthyArticleCount: number
  watchArticleCount: number
  criticalArticleCount: number
  articles: ArticleSeoMetric[]
}

export function buildSeoDashboardMetrics(articles: Article[]): SeoDashboardMetrics {
  const rows = articles.map(scoreArticleSeo)
  const alertCount = rows.reduce((total, row) => total + row.alerts.length, 0)
  const criticalAlertCount = rows.reduce(
    (total, row) => total + row.alerts.filter((alert) => alert.severity === 'critical').length,
    0,
  )

  return {
    generatedAt: new Date().toISOString(),
    articleCount: rows.length,
    averageScore: Math.round(rows.reduce((total, row) => total + row.score, 0) / Math.max(rows.length, 1)),
    alertCount,
    criticalAlertCount,
    healthyArticleCount: rows.filter((row) => row.score >= 90 && row.alerts.length === 0).length,
    watchArticleCount: rows.filter((row) => row.score >= 70 && row.alerts.length > 0).length,
    criticalArticleCount: rows.filter((row) => row.score < 70).length,
    articles: rows,
  }
}

export function scoreArticleSeo(article: Article): ArticleSeoMetric {
  const alerts: SeoAlert[] = []

  if (article.title.length < TITLE_MIN) {
    alerts.push({
      code: 'short-title',
      message: `Title is shorter than ${TITLE_MIN} characters.`,
      severity: 'warning',
    })
  }
  if (article.title.length > TITLE_MAX) {
    alerts.push({
      code: 'long-title',
      message: `Title is longer than ${TITLE_MAX} characters.`,
      severity: 'warning',
    })
  }
  if (article.excerpt.length < EXCERPT_MIN) {
    alerts.push({
      code: 'short-excerpt',
      message: `Excerpt is shorter than ${EXCERPT_MIN} characters.`,
      severity: 'warning',
    })
  }
  if (article.excerpt.length > EXCERPT_MAX) {
    alerts.push({
      code: 'long-excerpt',
      message: `Excerpt is longer than ${EXCERPT_MAX} characters.`,
      severity: 'warning',
    })
  }
  if (article.body.length < BODY_MIN) {
    alerts.push({
      code: 'thin-body',
      message: `Body is shorter than ${BODY_MIN} characters.`,
      severity: 'critical',
    })
  }
  if (article.tags.length === 0) {
    alerts.push({
      code: 'missing-tags',
      message: 'Article has no topic tags.',
      severity: 'warning',
    })
  }
  if (!article.title.toLowerCase().includes(TON_KEYWORD)) {
    alerts.push({
      code: 'missing-ton-keyword',
      message: 'Title does not include the TON keyword.',
      severity: 'warning',
    })
  }
  if (!/^[-a-z0-9]+$/.test(article.slug)) {
    alerts.push({
      code: 'noncanonical-slug',
      message: 'Slug is not lowercase URL-safe text.',
      severity: 'critical',
    })
  }

  const criticalPenalty = alerts.filter((alert) => alert.severity === 'critical').length * 18
  const warningPenalty = alerts.filter((alert) => alert.severity === 'warning').length * 10

  return {
    slug: article.slug,
    title: article.title,
    score: Math.max(0, 100 - criticalPenalty - warningPenalty),
    titleLength: article.title.length,
    excerptLength: article.excerpt.length,
    bodyLength: article.body.length,
    tagCount: article.tags.length,
    alerts,
  }
}

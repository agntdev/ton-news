import type { Submission } from './submissions'

export type QualitySeverity = 'info' | 'warning' | 'critical'

export interface QualityIssue {
  code: string
  message: string
  severity: QualitySeverity
}

export interface QualityReport {
  score: number
  status: 'ready' | 'needs_review' | 'blocked'
  issues: QualityIssue[]
}

const SOURCE_LINK_PATTERN = /https?:\/\/[^\s)]+/g
const FINANCIAL_ADVICE_PATTERN =
  /\b(guaranteed returns?|not financial advice|price will|100x|risk[- ]?free)\b/i

export function evaluateSubmissionQuality(submission: Submission): QualityReport {
  const issues: QualityIssue[] = []

  addLengthIssue(issues, 'title_length', submission.title.length, 35, 90, 'title')
  addLengthIssue(
    issues,
    'excerpt_length',
    submission.excerpt.length,
    80,
    180,
    'excerpt',
  )

  if (submission.body.length < 700) {
    issues.push({
      code: 'body_depth',
      message: 'Body is short for an evergreen TON article.',
      severity: 'warning',
    })
  }

  if ((submission.body.match(SOURCE_LINK_PATTERN) ?? []).length === 0) {
    issues.push({
      code: 'missing_sources',
      message: 'Body should include at least one source link.',
      severity: 'critical',
    })
  }

  if (submission.tags.length === 0) {
    issues.push({
      code: 'missing_tags',
      message: 'Add at least one reusable topic tag.',
      severity: 'warning',
    })
  }

  if (submission.tags.length > 5) {
    issues.push({
      code: 'too_many_tags',
      message: 'Use five or fewer focused tags.',
      severity: 'info',
    })
  }

  if (!/^[-a-z0-9_]+$/.test(submission.id)) {
    issues.push({
      code: 'noncanonical_slug',
      message: 'Submission id is not URL-friendly.',
      severity: 'info',
    })
  }

  if (FINANCIAL_ADVICE_PATTERN.test(`${submission.title} ${submission.excerpt} ${submission.body}`)) {
    issues.push({
      code: 'financial_advice_risk',
      message: 'Check for promotional claims or investment advice.',
      severity: 'critical',
    })
  }

  const score = Math.max(
    0,
    100 -
      issues.reduce((total, issue) => {
        if (issue.severity === 'critical') return total + 35
        if (issue.severity === 'warning') return total + 15
        return total + 5
      }, 0),
  )

  return {
    score,
    status: issues.some((issue) => issue.severity === 'critical')
      ? 'blocked'
      : issues.some((issue) => issue.severity === 'warning')
        ? 'needs_review'
        : 'ready',
    issues,
  }
}

function addLengthIssue(
  issues: QualityIssue[],
  code: string,
  actual: number,
  min: number,
  max: number,
  label: string,
) {
  if (actual < min) {
    issues.push({
      code,
      message: `The ${label} is shorter than the recommended ${min} characters.`,
      severity: 'warning',
    })
  } else if (actual > max) {
    issues.push({
      code,
      message: `The ${label} is longer than the recommended ${max} characters.`,
      severity: 'info',
    })
  }
}

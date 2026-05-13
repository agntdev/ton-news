import type { Metadata } from 'next'
import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/auth'
import { evaluateSubmissionQuality } from '@/lib/content-quality'
import { listSubmissions, setSubmissionStatus } from '@/lib/submissions'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Moderation queue',
  robots: { index: false, follow: false },
}

const qualityStatusLabels = {
  ready: 'Ready',
  needs_review: 'Needs review',
  blocked: 'Blocked',
} as const

const qualityStatusClasses = {
  ready: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  needs_review: 'border-amber-200 bg-amber-50 text-amber-800',
  blocked: 'border-red-200 bg-red-50 text-red-700',
} as const

const severityClasses = {
  info: 'text-ink-500',
  warning: 'text-amber-700',
  critical: 'text-red-700',
} as const

async function approve(formData: FormData) {
  'use server'
  const moderator = await requireRole('moderator')
  const id = String(formData.get('id') ?? '')
  const note = String(formData.get('note') ?? '').trim() || undefined
  await setSubmissionStatus(id, { status: 'approved', reviewerId: moderator.id, reviewNote: note })
  revalidatePath('/moderation')
  revalidatePath('/articles')
}

async function reject(formData: FormData) {
  'use server'
  const moderator = await requireRole('moderator')
  const id = String(formData.get('id') ?? '')
  const note = String(formData.get('note') ?? '').trim() || undefined
  await setSubmissionStatus(id, { status: 'rejected', reviewerId: moderator.id, reviewNote: note })
  revalidatePath('/moderation')
}

export default async function ModerationPage() {
  const moderator = await requireRole('moderator')
  const pending = await listSubmissions({ status: 'pending' })
  const approved = await listSubmissions({ status: 'approved' })
  const rejected = await listSubmissions({ status: 'rejected' })
  const qualityReports = new Map(pending.map((sub) => [sub.id, evaluateSubmissionQuality(sub)]))
  const qualityTotals = pending.reduce(
    (totals, sub) => {
      const report = qualityReports.get(sub.id)
      if (!report) return totals
      totals[report.status] += 1
      totals.criticalIssues += report.issues.filter((issue) => issue.severity === 'critical').length
      return totals
    },
    { ready: 0, needs_review: 0, blocked: 0, criticalIssues: 0 },
  )

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <header className="mb-8 flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Moderation queue</h1>
          <p className="mt-1 text-sm text-ink-500">
            Signed in as <strong>{moderator.username}</strong> · {pending.length} pending,
            {' '}{approved.length} approved, {rejected.length} rejected
          </p>
          <p className="mt-1 text-xs text-ink-500">
            Quality checks: {qualityTotals.ready} ready, {qualityTotals.needs_review} needs review,
            {' '}{qualityTotals.blocked} blocked, {qualityTotals.criticalIssues} critical issues
          </p>
        </div>
        <form action="/logout" method="post">
          <button type="submit" className="text-sm text-ink-500 hover:text-ink-900">
            Sign out
          </button>
        </form>
      </header>

      {pending.length === 0 ? (
        <p className="rounded-md border border-ink-100 bg-white p-6 text-sm text-ink-500">
          No pending submissions.
        </p>
      ) : (
        <ul className="space-y-6">
          {pending.map((sub) => {
            const report = qualityReports.get(sub.id)

            return (
              <li key={sub.id} className="rounded-2xl border border-ink-100 bg-white p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h2 className="text-lg font-semibold text-ink-900">{sub.title}</h2>
                  <time className="text-xs text-ink-500" dateTime={sub.submittedAt}>
                    {new Date(sub.submittedAt).toLocaleString()}
                  </time>
                </div>
                <p className="mt-1 text-xs text-ink-500">
                  by {sub.authorName}
                  {sub.tags.length > 0 ? <> · {sub.tags.join(', ')}</> : null}
                </p>
                <p className="mt-3 text-sm text-ink-500">{sub.excerpt}</p>

                {report ? (
                  <section className="mt-4 rounded-md border border-ink-100 bg-ink-50 p-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold text-ink-900">Quality score {report.score}/100</h3>
                      <span
                        className={`rounded-full border px-2 py-1 text-xs font-semibold ${qualityStatusClasses[report.status]}`}
                      >
                        {qualityStatusLabels[report.status]}
                      </span>
                    </div>
                    {report.issues.length > 0 ? (
                      <ul className="mt-3 space-y-1">
                        {report.issues.map((issue) => (
                          <li key={issue.code} className={severityClasses[issue.severity]}>
                            <strong className="capitalize">{issue.severity}:</strong> {issue.message}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-ink-500">No automated quality issues detected.</p>
                    )}
                  </section>
                ) : null}

                <details className="mt-3 rounded-md bg-ink-50 p-3 text-sm">
                  <summary className="cursor-pointer text-ink-900">Read body</summary>
                  <pre className="mt-3 whitespace-pre-wrap font-mono text-xs text-ink-900">{sub.body}</pre>
                </details>

                <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                  <input
                    form={`approve-${sub.id}`}
                    type="text"
                    name="note"
                    placeholder="Reviewer note (optional)"
                    className="rounded-md border border-ink-100 bg-white px-3 py-2 text-sm"
                  />
                  <form id={`approve-${sub.id}`} action={approve}>
                    <input type="hidden" name="id" value={sub.id} />
                    <button
                      type="submit"
                      className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      Approve
                    </button>
                  </form>
                  <form action={reject}>
                    <input type="hidden" name="id" value={sub.id} />
                    <button
                      type="submit"
                      className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                    >
                      Reject
                    </button>
                  </form>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

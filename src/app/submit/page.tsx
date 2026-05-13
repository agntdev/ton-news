import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import { createSubmission } from '@/lib/submissions'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Submit an article',
  description: 'Submit an article for editorial review on Ton News.',
  robots: { index: false },
}

interface PageProps {
  searchParams?: { error?: string; ok?: string }
}

async function submit(formData: FormData) {
  'use server'
  const user = await requireUser()
  const title = String(formData.get('title') ?? '')
  const excerpt = String(formData.get('excerpt') ?? '')
  const body = String(formData.get('body') ?? '')
  const tags = String(formData.get('tags') ?? '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  try {
    await createSubmission({
      title,
      excerpt,
      body,
      tags,
      authorId: user.id,
      authorName: user.username,
    })
  } catch (error) {
    const code = (error as Error & { code?: string }).code
    const message = code === 'VALIDATION' ? (error as Error).message : 'submission_failed'
    redirect(`/submit?error=${encodeURIComponent(message)}`)
  }
  redirect('/submit?ok=1')
}

export default async function SubmitPage({ searchParams }: PageProps) {
  const user = await requireUser()
  const error = searchParams?.error
  const ok = searchParams?.ok

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Submit a story</h1>
        <p className="mt-2 text-sm text-ink-500">
          Signed in as <strong>{user.username}</strong>. Submissions are queued
          for moderator review before publication.
        </p>
      </header>

      {ok ? (
        <p className="mb-6 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Thanks — your submission is queued for review. You&apos;ll see it on
          the article index once a moderator approves it.
        </p>
      ) : null}
      {error ? (
        <p className="mb-6 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <form action={submit} className="space-y-5">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-ink-900">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            required
            minLength={5}
            maxLength={120}
            className="mt-1 w-full rounded-md border border-ink-100 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light"
          />
        </div>
        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium text-ink-900">Excerpt</label>
          <textarea
            id="excerpt"
            name="excerpt"
            required
            minLength={20}
            maxLength={280}
            rows={2}
            className="mt-1 w-full rounded-md border border-ink-100 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light"
          />
          <p className="mt-1 text-xs text-ink-500">2–3 sentences. Shows on the article card.</p>
        </div>
        <div>
          <label htmlFor="body" className="block text-sm font-medium text-ink-900">Body (Markdown)</label>
          <textarea
            id="body"
            name="body"
            required
            minLength={100}
            rows={12}
            className="mt-1 w-full rounded-md border border-ink-100 bg-white px-3 py-2 font-mono text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light"
          />
        </div>
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-ink-900">Tags</label>
          <input
            id="tags"
            name="tags"
            type="text"
            placeholder="protocol, validators, defi"
            className="mt-1 w-full rounded-md border border-ink-100 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light"
          />
          <p className="mt-1 text-xs text-ink-500">Comma-separated.</p>
        </div>
        <button
          type="submit"
          className="inline-flex rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Submit for review
        </button>
      </form>
    </div>
  )
}

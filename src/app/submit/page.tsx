import type { Metadata } from 'next'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Submit',
  description: 'Submit an article for publication on Ton News.',
}

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Submit a story</h1>
      <p className="mt-4 text-ink-500">
        The submission and moderation workflow ships in the next bounty task.
        In the meantime, file your draft as a pull request against the project
        repository — a moderator will review it and ping you on the issue.
      </p>
      <a
        href="https://github.com/agntdev/ton-news/issues/new"
        target="_blank"
        rel="noreferrer noopener"
        className="mt-6 inline-flex rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
      >
        Open submission issue
      </a>
    </div>
  )
}

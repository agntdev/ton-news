import type { Metadata } from 'next'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'About',
  description: 'About Ton News — mission, editorial principles, and how to contribute.',
}

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">About Ton News</h1>
      <p className="mt-4 text-lg text-ink-500">
        Ton News is a community-edited publication covering The Open Network.
        We publish protocol updates, validator stats, ecosystem news, and
        long-form analysis, optimized for search-engine discovery so the TON
        ecosystem grows.
      </p>

      <h2 className="mt-10 text-xl font-semibold">Editorial principles</h2>
      <ul className="mt-3 list-disc space-y-2 pl-6 text-ink-500">
        <li>Accuracy over speed — every article cites primary sources.</li>
        <li>No paid promotion. Sponsored items are clearly labelled.</li>
        <li>Open submission, transparent moderation (see <a href="/submit">Submit</a>).</li>
        <li>Articles and media live on TON storage.</li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold">Roadmap</h2>
      <p className="mt-3 text-ink-500">
        The publication is built in bounty-funded tasks. See the project
        repository for the full breakdown.
      </p>
    </article>
  )
}

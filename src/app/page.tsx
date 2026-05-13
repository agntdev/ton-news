import Link from 'next/link'
import { listPublishedArticles } from '@/lib/articles'
import { ArticleCard } from '@/components/article-card'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const articles = await listPublishedArticles()
  const featured = articles[0]
  const recent = articles.slice(1)

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <section className="rounded-3xl bg-gradient-to-br from-brand to-brand-dark px-6 py-12 text-white shadow-sm sm:px-10 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
          The Open Network · Daily
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Ton News
        </h1>
        <p className="mt-4 max-w-2xl text-base text-white/85 sm:text-lg">
          Curated, SEO-focused coverage of The Open Network. Protocol updates,
          validator stats, ecosystem news, and long-form analysis — open to
          community submissions.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/articles"
            className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-brand-dark hover:bg-white/90"
          >
            Browse articles
          </Link>
          <Link
            href="/submit"
            className="rounded-md border border-white/40 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            Submit a story
          </Link>
        </div>
      </section>

      {featured ? (
        <section className="mt-12">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-500">
            Featured
          </h2>
          <div className="mt-3">
            <ArticleCard article={featured} />
          </div>
        </section>
      ) : null}

      {recent.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-500">
            Recent
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

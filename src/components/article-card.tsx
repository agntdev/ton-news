import Link from 'next/link'
import type { Article } from '@/lib/articles'

export function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="group min-h-56 rounded-2xl border border-ink-100 bg-white p-5 [contain-intrinsic-size:1px_224px] [content-visibility:auto] motion-safe:transition hover:border-brand-light hover:shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-ink-500">
        {article.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-ink-50 px-2 py-0.5">
            {tag}
          </span>
        ))}
        <time dateTime={article.publishedAt} className="sm:ml-auto">
          {article.publishedAt}
        </time>
      </div>
      <h3 className="mt-3 text-lg font-semibold leading-snug text-ink-900 group-hover:text-brand-dark">
        <Link href={`/articles/${article.slug}`}>{article.title}</Link>
      </h3>
      <p className="mt-2 text-sm leading-6 text-ink-500">{article.excerpt}</p>
      <p className="mt-4 text-xs text-ink-500">By {article.author}</p>
    </article>
  )
}

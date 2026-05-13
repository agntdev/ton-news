import type { Metadata } from 'next'
import { SAMPLE_ARTICLES } from '@/lib/articles'
import { ArticleCard } from '@/components/article-card'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Articles',
  description: 'All published articles on Ton News.',
}

export default function ArticlesIndex() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Articles</h1>
        <p className="mt-2 text-sm text-ink-500">
          {SAMPLE_ARTICLES.length} {SAMPLE_ARTICLES.length === 1 ? 'article' : 'articles'} published.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SAMPLE_ARTICLES.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </div>
  )
}

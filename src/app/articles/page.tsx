import type { Metadata } from 'next'
import { listPublishedArticles } from '@/lib/articles'
import { ArticleCard } from '@/components/article-card'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Articles',
  description: 'All published articles on Ton News.',
}

export default async function ArticlesIndex() {
  const articles = await listPublishedArticles()
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Articles</h1>
        <p className="mt-2 text-sm text-ink-500">
          {articles.length} {articles.length === 1 ? 'article' : 'articles'} published.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </div>
  )
}

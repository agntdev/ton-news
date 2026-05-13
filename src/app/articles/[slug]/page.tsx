import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getArticleBySlug, listPublishedArticles } from '@/lib/articles'
import { SITE_NAME, absoluteUrl } from '@/lib/seo'

interface ArticlePageProps {
  params: { slug: string }
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug)
  if (!article) return {}

  const url = absoluteUrl(`/articles/${article.slug}`)
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: url },
    keywords: ['TON', 'The Open Network', ...article.tags],
    openGraph: {
      type: 'article',
      siteName: SITE_NAME,
      title: article.title,
      description: article.excerpt,
      url,
      publishedTime: article.publishedAt,
      authors: [article.author],
      tags: article.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
    },
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticleBySlug(params.slug)
  if (!article) notFound()

  const articleUrl = absoluteUrl(`/articles/${article.slug}`)
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    mainEntityOfPage: articleUrl,
    url: articleUrl,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: absoluteUrl('/'),
    },
    keywords: article.tags.join(', '),
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <header>
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-ink-500">
          {article.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-ink-50 px-2 py-0.5">
              {tag}
            </span>
          ))}
          <time dateTime={article.publishedAt}>{article.publishedAt}</time>
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink-900">
          {article.title}
        </h1>
        <p className="mt-4 text-lg text-ink-500">{article.excerpt}</p>
        <p className="mt-4 text-sm text-ink-500">By {article.author}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(article.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-ink-100 bg-white px-3 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50"
          >
            Share on X
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-ink-100 bg-white px-3 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50"
          >
            Share on LinkedIn
          </a>
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(article.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-ink-100 bg-white px-3 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50"
          >
            Share on Telegram
          </a>
        </div>
      </header>

      <div className="mt-10 space-y-5 text-base leading-7 text-ink-700">
        {article.body.split('\n\n').map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </article>
  )
}

export async function generateStaticParams() {
  const articles = await listPublishedArticles()
  return articles.map((article) => ({ slug: article.slug }))
}

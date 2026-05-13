import type { MetadataRoute } from 'next'
import { listPublishedArticles } from '@/lib/articles'
import { absoluteUrl } from '@/lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await listPublishedArticles()
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl('/'),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: absoluteUrl('/articles'),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: absoluteUrl('/about'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: absoluteUrl('/submit'),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  return [
    ...staticRoutes,
    ...articles.map((article) => ({
      url: absoluteUrl(`/articles/${article.slug}`),
      lastModified: article.publishedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]
}

export interface Article {
  slug: string
  title: string
  excerpt: string
  body: string
  author: string
  publishedAt: string
  tags: string[]
}

export const SAMPLE_ARTICLES: Article[] = [
  {
    slug: 'welcome-to-ton-news',
    title: 'Welcome to Ton News',
    excerpt:
      'A community-edited, SEO-focused publication covering The Open Network.',
    body:
      'Ton News is the front page for the TON ecosystem. This scaffold ships the structure; future tasks add submission, moderation, and TON storage integration.',
    author: 'ton-news-team',
    publishedAt: '2026-05-13',
    tags: ['announcement'],
  },
]

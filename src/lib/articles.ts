import { promises as fs } from 'node:fs'
import path from 'node:path'
import { listSubmissions, type Submission } from './submissions'
import { getTonStorageArticle, listTonStorageArticleRefs } from './ton-storage'

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

const ARTICLES_FILE = path.join(process.cwd(), 'data', 'articles.json')

async function readStoredArticles(): Promise<Article[]> {
  try {
    const raw = await fs.readFile(ARTICLES_FILE, 'utf8')
    return JSON.parse(raw) as Article[]
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw error
  }
}

function submissionToArticle(submission: Submission): Article {
  return {
    slug: submission.id,
    title: submission.title,
    excerpt: submission.excerpt,
    body: submission.body,
    author: submission.authorName,
    publishedAt: (submission.reviewedAt ?? submission.submittedAt).slice(0, 10),
    tags: submission.tags,
  }
}

export async function listPublishedArticles(): Promise<Article[]> {
  const approved = await listSubmissions({ status: 'approved' })
  const fromSubmissions = approved.map(submissionToArticle)
  const tonStorageRefs = await listTonStorageArticleRefs()
  const fromTonStorage = tonStorageRefs.map((ref) => ({
    slug: ref.slug,
    title: ref.title,
    excerpt: ref.excerpt,
    body: '',
    author: ref.author,
    publishedAt: ref.publishedAt,
    tags: ref.tags,
  }))
  const stored = await readStoredArticles()
  return [...fromTonStorage, ...stored, ...fromSubmissions, ...SAMPLE_ARTICLES].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  )
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const tonStorageArticle = await getTonStorageArticle(slug)
  if (tonStorageArticle) return tonStorageArticle
  const articles = await listPublishedArticles()
  return articles.find((article) => article.slug === slug) ?? null
}

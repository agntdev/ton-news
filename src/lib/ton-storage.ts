import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { Article } from './articles'

export interface TonStorageArticleRef {
  slug: string
  title: string
  excerpt: string
  author: string
  publishedAt: string
  tags: string[]
  bagId: string
  path: string
  gatewayUrl?: string
}

const MANIFEST_FILE = path.join(process.cwd(), 'data', 'ton-storage-manifest.json')
const DEFAULT_GATEWAY = process.env.TON_STORAGE_GATEWAY_URL ?? 'https://storage.ton'

export async function listTonStorageArticleRefs(): Promise<TonStorageArticleRef[]> {
  try {
    const raw = await fs.readFile(MANIFEST_FILE, 'utf8')
    return JSON.parse(raw) as TonStorageArticleRef[]
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw error
  }
}

export async function getTonStorageArticle(slug: string): Promise<Article | null> {
  const refs = await listTonStorageArticleRefs()
  const ref = refs.find((item) => item.slug === slug)
  if (!ref) return null
  const url = tonStorageGatewayUrl(ref)
  const response = await fetch(url, { next: { revalidate: 300 } })
  if (!response.ok) {
    throw new Error(`TON Storage fetch failed for ${slug}: ${response.status}`)
  }
  const article = (await response.json()) as Article
  return {
    ...article,
    slug: ref.slug,
    title: ref.title,
    excerpt: ref.excerpt,
    author: ref.author,
    publishedAt: ref.publishedAt,
    tags: ref.tags,
  }
}

export function tonStorageUri(ref: Pick<TonStorageArticleRef, 'bagId' | 'path'>): string {
  return `tonstorage://${ref.bagId}/${ref.path.replace(/^\/+/, '')}`
}

function tonStorageGatewayUrl(ref: TonStorageArticleRef): string {
  const gateway = (ref.gatewayUrl ?? DEFAULT_GATEWAY).replace(/\/$/, '')
  return `${gateway}/gateway/${ref.bagId}/${ref.path.replace(/^\/+/, '')}`
}

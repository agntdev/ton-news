import { promises as fs } from 'node:fs'
import path from 'node:path'

export type CommentStatus = 'pending' | 'approved' | 'rejected'
export type FeedbackKind = 'comment' | 'correction' | 'source' | 'question'

export interface CommentRecord {
  id: string
  articleSlug: string
  body: string
  authorId: string
  authorName: string
  kind: FeedbackKind
  status: CommentStatus
  submittedAt: string
  reviewedAt?: string
  reviewerId?: string
  reviewNote?: string
}

export interface NewCommentInput {
  articleSlug: string
  body: string
  authorId: string
  authorName: string
  kind?: FeedbackKind
}

const COMMENTS_FILE = path.join(process.cwd(), 'data', 'comments.json')
const FEEDBACK_KINDS: FeedbackKind[] = ['comment', 'correction', 'source', 'question']

async function readAll(): Promise<CommentRecord[]> {
  try {
    const raw = await fs.readFile(COMMENTS_FILE, 'utf8')
    return JSON.parse(raw) as CommentRecord[]
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw error
  }
}

async function writeAll(rows: CommentRecord[]): Promise<void> {
  await fs.mkdir(path.dirname(COMMENTS_FILE), { recursive: true })
  await fs.writeFile(COMMENTS_FILE, JSON.stringify(rows, null, 2) + '\n', 'utf8')
}

export async function listComments(filter?: {
  articleSlug?: string
  status?: CommentStatus
}): Promise<CommentRecord[]> {
  const rows = await readAll()
  return rows.filter((row) => {
    if (filter?.articleSlug && row.articleSlug !== filter.articleSlug) return false
    if (filter?.status && row.status !== filter.status) return false
    return true
  })
}

export async function createComment(input: NewCommentInput): Promise<CommentRecord> {
  validateComment(input)
  const comment: CommentRecord = {
    id: `cmt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    articleSlug: input.articleSlug.trim(),
    body: input.body.trim(),
    authorId: input.authorId,
    authorName: input.authorName,
    kind: input.kind ?? 'comment',
    status: 'pending',
    submittedAt: new Date().toISOString(),
  }
  const rows = await readAll()
  rows.push(comment)
  await writeAll(rows)
  return comment
}

export async function setCommentStatus(
  id: string,
  next: { status: Exclude<CommentStatus, 'pending'>; reviewerId: string; reviewNote?: string },
): Promise<CommentRecord> {
  const rows = await readAll()
  const idx = rows.findIndex((row) => row.id === id)
  if (idx === -1) throw new Error('Comment not found')
  if (rows[idx].status !== 'pending') {
    throw new Error(`Comment already ${rows[idx].status}`)
  }
  const updated: CommentRecord = {
    ...rows[idx],
    status: next.status,
    reviewedAt: new Date().toISOString(),
    reviewerId: next.reviewerId,
    reviewNote: next.reviewNote,
  }
  rows[idx] = updated
  await writeAll(rows)
  return updated
}

export function validateComment(input: NewCommentInput): void {
  const errors: string[] = []
  if (!input.articleSlug || !/^[-a-z0-9_]+$/.test(input.articleSlug)) {
    errors.push('Article slug is required')
  }
  const body = input.body.trim()
  if (body.length < 10) {
    errors.push('Comment must be at least 10 characters')
  }
  if (body.length > 1000) {
    errors.push('Comment must be at most 1000 characters')
  }
  if (input.kind && !FEEDBACK_KINDS.includes(input.kind)) {
    errors.push('Feedback type is invalid')
  }
  if (!input.authorId || !input.authorName) {
    errors.push('Author identity is required')
  }
  if (errors.length) {
    const err = new Error(errors.join('; '))
    ;(err as Error & { code?: string }).code = 'VALIDATION'
    throw err
  }
}

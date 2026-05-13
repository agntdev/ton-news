import { promises as fs } from 'node:fs'
import path from 'node:path'

export type SubmissionStatus = 'pending' | 'approved' | 'rejected'

export interface Submission {
  id: string
  title: string
  excerpt: string
  body: string
  authorId: string
  authorName: string
  status: SubmissionStatus
  tags: string[]
  submittedAt: string
  reviewedAt?: string
  reviewerId?: string
  reviewNote?: string
}

const SUBMISSIONS_FILE = path.join(process.cwd(), 'data', 'submissions.json')

async function readAll(): Promise<Submission[]> {
  try {
    const raw = await fs.readFile(SUBMISSIONS_FILE, 'utf8')
    return JSON.parse(raw) as Submission[]
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw error
  }
}

async function writeAll(rows: Submission[]): Promise<void> {
  await fs.mkdir(path.dirname(SUBMISSIONS_FILE), { recursive: true })
  await fs.writeFile(SUBMISSIONS_FILE, JSON.stringify(rows, null, 2) + '\n', 'utf8')
}

export async function listSubmissions(filter?: { status?: SubmissionStatus }): Promise<Submission[]> {
  const rows = await readAll()
  return filter?.status ? rows.filter((r) => r.status === filter.status) : rows
}

export async function getSubmission(id: string): Promise<Submission | null> {
  const rows = await readAll()
  return rows.find((r) => r.id === id) ?? null
}

export interface NewSubmissionInput {
  title: string
  excerpt: string
  body: string
  authorId: string
  authorName: string
  tags?: string[]
}

export async function createSubmission(input: NewSubmissionInput): Promise<Submission> {
  validateSubmission(input)
  const submission: Submission = {
    id: `sub_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    title: input.title.trim(),
    excerpt: input.excerpt.trim(),
    body: input.body.trim(),
    authorId: input.authorId,
    authorName: input.authorName,
    status: 'pending',
    tags: (input.tags ?? []).map((t) => t.trim()).filter(Boolean),
    submittedAt: new Date().toISOString(),
  }
  const rows = await readAll()
  rows.push(submission)
  await writeAll(rows)
  return submission
}

export async function setSubmissionStatus(
  id: string,
  next: { status: Exclude<SubmissionStatus, 'pending'>; reviewerId: string; reviewNote?: string },
): Promise<Submission> {
  const rows = await readAll()
  const idx = rows.findIndex((r) => r.id === id)
  if (idx === -1) throw new Error('Submission not found')
  if (rows[idx].status !== 'pending') {
    throw new Error(`Submission already ${rows[idx].status}`)
  }
  const updated: Submission = {
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

export function validateSubmission(input: NewSubmissionInput): void {
  const errors: string[] = []
  if (!input.title || input.title.trim().length < 5) {
    errors.push('Title must be at least 5 characters')
  }
  if (input.title && input.title.length > 120) {
    errors.push('Title must be at most 120 characters')
  }
  if (!input.excerpt || input.excerpt.trim().length < 20) {
    errors.push('Excerpt must be at least 20 characters')
  }
  if (input.excerpt && input.excerpt.length > 280) {
    errors.push('Excerpt must be at most 280 characters')
  }
  if (!input.body || input.body.trim().length < 100) {
    errors.push('Body must be at least 100 characters')
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

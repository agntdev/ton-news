import { createHmac, timingSafeEqual } from 'node:crypto'

const SESSION_SECRET = process.env.SESSION_SECRET || 'ton-news-dev-secret-do-not-use-in-prod'
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days

export interface SessionPayload {
  userId: string
  username: string
  role: 'reader' | 'author' | 'moderator'
  issuedAt: number
}

function base64UrlEncode(input: Buffer | string): string {
  const buf = typeof input === 'string' ? Buffer.from(input) : input
  return buf
    .toString('base64')
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function base64UrlDecode(input: string): Buffer {
  const padded = input + '='.repeat((4 - (input.length % 4)) % 4)
  return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
}

function sign(payload: string): string {
  return base64UrlEncode(createHmac('sha256', SESSION_SECRET).update(payload).digest())
}

export function encodeSession(payload: SessionPayload): string {
  const body = base64UrlEncode(JSON.stringify(payload))
  return `${body}.${sign(body)}`
}

export function decodeSession(token: string | undefined | null): SessionPayload | null {
  if (!token) return null
  const [body, mac] = token.split('.')
  if (!body || !mac) return null
  const expected = sign(body)
  const a = Buffer.from(mac)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    const payload = JSON.parse(base64UrlDecode(body).toString('utf8')) as SessionPayload
    if (typeof payload.userId !== 'string') return null
    const ageSeconds = (Date.now() - payload.issuedAt) / 1000
    if (ageSeconds < 0 || ageSeconds > SESSION_MAX_AGE_SECONDS) return null
    return payload
  } catch {
    return null
  }
}

export const SESSION_COOKIE = 'ton_news_session'
export { SESSION_MAX_AGE_SECONDS }

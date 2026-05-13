import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, decodeSession, encodeSession, type SessionPayload } from './sessions'
import type { UserRecord } from './users'
import { findUserById } from './users'

export async function getCurrentUser(): Promise<UserRecord | null> {
  const token = cookies().get(SESSION_COOKIE)?.value
  const session = decodeSession(token)
  if (!session) return null
  return findUserById(session.userId)
}

export async function requireUser(): Promise<UserRecord> {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  return user
}

export async function requireRole(role: SessionPayload['role']): Promise<UserRecord> {
  const user = await requireUser()
  if (!matchesRole(user.role, role)) redirect('/login?reason=forbidden')
  return user
}

function matchesRole(actual: UserRecord['role'], required: SessionPayload['role']): boolean {
  if (required === 'reader') return true
  if (required === 'author') return actual === 'author' || actual === 'moderator'
  if (required === 'moderator') return actual === 'moderator'
  return false
}

export function loginUser(user: UserRecord): void {
  const token = encodeSession({
    userId: user.id,
    username: user.username,
    role: user.role,
    issuedAt: Date.now(),
  })
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  })
}

export function logoutCurrentUser(): void {
  cookies().delete(SESSION_COOKIE)
}

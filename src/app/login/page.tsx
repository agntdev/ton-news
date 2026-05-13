import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { authenticateUser } from '@/lib/users'
import { loginUser } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false },
}

interface PageProps {
  searchParams?: { reason?: string; error?: string; next?: string }
}

async function login(formData: FormData) {
  'use server'
  const username = String(formData.get('username') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const next = String(formData.get('next') ?? '/submit')
  if (!username || !password) {
    redirect(`/login?error=missing&next=${encodeURIComponent(next)}`)
  }
  const user = await authenticateUser(username, password)
  if (!user) {
    redirect(`/login?error=invalid&next=${encodeURIComponent(next)}`)
  }
  loginUser(user)
  redirect(next.startsWith('/') ? next : '/submit')
}

export default function LoginPage({ searchParams }: PageProps) {
  const reason = searchParams?.reason
  const error = searchParams?.error
  const next = searchParams?.next ?? '/submit'

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-2 text-sm text-ink-500">
        Authenticate to submit articles or access the moderation dashboard.
      </p>

      {reason === 'forbidden' ? (
        <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          You don&apos;t have permission for that page. Sign in with a moderator account.
        </p>
      ) : null}
      {error === 'invalid' ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Invalid username or password.
        </p>
      ) : null}
      {error === 'missing' ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Username and password are required.
        </p>
      ) : null}

      <form action={login} className="mt-6 space-y-4">
        <input type="hidden" name="next" value={next} />
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-ink-900">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            className="mt-1 w-full rounded-md border border-ink-100 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink-900">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-1 w-full rounded-md border border-ink-100 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light"
          />
        </div>
        <button
          type="submit"
          className="inline-flex w-full justify-center rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Sign in
        </button>
      </form>

      <p className="mt-6 text-xs text-ink-500">
        Seeded accounts for local development are listed in <code>data/users.json</code>.
        Default moderator: <code>moderator</code> / <code>moderator-pass</code>.
      </p>
    </div>
  )
}

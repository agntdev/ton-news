import { absoluteUrl } from './seo'

export function isGithubLoginConfigured(): boolean {
  return Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET)
}

export function githubAuthorizeUrl(next = '/submit'): string {
  const url = new URL('https://github.com/login/oauth/authorize')
  url.searchParams.set('client_id', process.env.GITHUB_CLIENT_ID ?? '')
  url.searchParams.set('redirect_uri', absoluteUrl('/api/auth/social/github/callback'))
  url.searchParams.set('scope', 'read:user user:email')
  url.searchParams.set('state', encodeURIComponent(next.startsWith('/') ? next : '/submit'))
  return url.toString()
}

export async function exchangeGithubCode(code: string): Promise<{
  id: number
  login: string
  email?: string
}> {
  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  })
  const tokenPayload = (await tokenResponse.json()) as { access_token?: string; error?: string }
  if (!tokenPayload.access_token) {
    throw new Error(tokenPayload.error ?? 'github_token_exchange_failed')
  }

  const userResponse = await fetch('https://api.github.com/user', {
    headers: {
      authorization: `Bearer ${tokenPayload.access_token}`,
      accept: 'application/vnd.github+json',
    },
  })
  if (!userResponse.ok) throw new Error('github_user_fetch_failed')
  const profile = (await userResponse.json()) as { id: number; login: string; email?: string }

  return {
    id: profile.id,
    login: profile.login,
    email: profile.email,
  }
}

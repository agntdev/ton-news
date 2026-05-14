import { redirect } from 'next/navigation'
import { loginUser } from '@/lib/auth'
import { exchangeGithubCode } from '@/lib/social-auth'
import { findOrCreateSocialUser } from '@/lib/users'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = decodeURIComponent(url.searchParams.get('state') ?? '/submit')
  if (!code) redirect('/login?error=social_failed')

  try {
    const profile = await exchangeGithubCode(code)
    const user = await findOrCreateSocialUser({
      provider: 'github',
      providerId: String(profile.id),
      username: profile.login,
      email: profile.email,
    })
    loginUser(user)
    redirect(next.startsWith('/') ? next : '/submit')
  } catch {
    redirect('/login?error=social_failed')
  }
}

import { redirect } from 'next/navigation'
import { githubAuthorizeUrl, isGithubLoginConfigured } from '@/lib/social-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  if (!isGithubLoginConfigured()) {
    redirect('/login?error=social_unavailable')
  }
  const url = new URL(request.url)
  const next = url.searchParams.get('next') ?? '/submit'
  redirect(githubAuthorizeUrl(next))
}

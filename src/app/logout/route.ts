import { NextResponse } from 'next/server'
import { logoutCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST() {
  logoutCurrentUser()
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'))
}

import { NextResponse } from 'next/server'
import { recordPageView } from '@/lib/analytics'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { path?: string; referrer?: string }
    if (!body.path) {
      return NextResponse.json({ error: 'path_required' }, { status: 400 })
    }
    await recordPageView({
      path: body.path,
      referrer: body.referrer,
      userAgent: request.headers.get('user-agent') ?? undefined,
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'analytics_failed' }, { status: 400 })
  }
}

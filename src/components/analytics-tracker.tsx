'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function AnalyticsTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname || navigator.doNotTrack === '1') return

    const payload = JSON.stringify({
      path: pathname,
      referrer: document.referrer || undefined,
    })

    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics', new Blob([payload], { type: 'application/json' }))
      return
    }

    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => undefined)
  }, [pathname])

  return null
}

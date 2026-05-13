import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://ton-news.example.com'),
  title: {
    default: 'Ton News — TON blockchain updates, analysis, and ecosystem coverage',
    template: '%s · Ton News',
  },
  description:
    'Curated news, deep dives, and ecosystem updates for The Open Network (TON). SEO-focused, community-edited, hosted on TON storage.',
  openGraph: {
    type: 'website',
    siteName: 'Ton News',
    title: 'Ton News',
    description: 'TON blockchain news and ecosystem coverage.',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col bg-ink-50 text-ink-900 antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand focus:px-3 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  )
}

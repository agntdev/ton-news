import type { Metadata } from 'next'
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
      <body className="min-h-full bg-ink-50 text-ink-900 antialiased">
        {children}
      </body>
    </html>
  )
}

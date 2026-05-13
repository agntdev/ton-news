import Link from 'next/link'

export function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="mt-24 border-t border-ink-100 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-2">
          <p className="text-sm font-semibold text-ink-900">Ton News</p>
          <p className="mt-2 max-w-md text-sm text-ink-500">
            Community-edited coverage of The Open Network. SEO-focused, hosted
            on TON storage.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
            Sections
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/articles">Articles</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/submit">Submit</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
            External
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href="https://ton.org" target="_blank" rel="noreferrer noopener">
                ton.org
              </a>
            </li>
            <li>
              <a href="https://github.com/agntdev/ton-news" target="_blank" rel="noreferrer noopener">
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-100">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 px-4 py-4 text-xs text-ink-500 sm:flex-row sm:items-center sm:px-6">
          <span>© {year} Ton News. MIT licensed.</span>
          <span>Built with Next.js · Hosted on TON storage</span>
        </div>
      </div>
    </footer>
  )
}

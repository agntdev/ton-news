import Link from 'next/link'

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/articles', label: 'Articles' },
  { href: '/about', label: 'About' },
  { href: '/submit', label: 'Submit' },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-ink-900 hover:text-brand"
        >
          <span aria-hidden="true" className="inline-block h-3 w-3 rounded-full bg-brand" />
          Ton News
        </Link>
        <nav aria-label="Primary">
          <ul className="flex items-center gap-1 text-sm font-medium text-ink-500 sm:gap-3">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-md px-2 py-1.5 hover:bg-ink-50 hover:text-ink-900"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}

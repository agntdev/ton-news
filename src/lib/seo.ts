export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
  'https://ton-news.example.com'

export const SITE_NAME = 'Ton News'
export const SITE_DESCRIPTION =
  'Curated news, deep dives, and ecosystem updates for The Open Network (TON).'

export function absoluteUrl(path = '/') {
  return new URL(path, SITE_URL).toString()
}

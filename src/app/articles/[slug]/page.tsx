import type { Metadata } from 'next'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getCurrentUser, requireUser } from '@/lib/auth'
import { getArticleBySlug, listPublishedArticles } from '@/lib/articles'
import { createComment, listComments, type FeedbackKind } from '@/lib/comments'
import { SITE_NAME, absoluteUrl } from '@/lib/seo'

interface ArticlePageProps {
  params: { slug: string }
  searchParams?: { feedback?: string; feedback_error?: string }
}

export const dynamic = 'force-dynamic'

const feedbackKinds: FeedbackKind[] = ['comment', 'correction', 'source', 'question']
const feedbackLabels: Record<FeedbackKind, string> = {
  comment: 'Comment',
  correction: 'Correction',
  source: 'Source tip',
  question: 'Question',
}

async function submitFeedback(formData: FormData) {
  'use server'
  const user = await requireUser()
  const articleSlug = String(formData.get('articleSlug') ?? '').trim()
  const body = String(formData.get('body') ?? '')
  const requestedKind = String(formData.get('kind') ?? 'comment') as FeedbackKind
  const kind = feedbackKinds.includes(requestedKind) ? requestedKind : 'comment'

  try {
    const article = await getArticleBySlug(articleSlug)
    if (!article) throw new Error('Article not found')
    await createComment({
      articleSlug,
      body,
      kind,
      authorId: user.id,
      authorName: user.username,
    })
  } catch (error) {
    const code = (error as Error & { code?: string }).code
    const message = code === 'VALIDATION' ? (error as Error).message : 'feedback_failed'
    redirect(`/articles/${articleSlug}?feedback_error=${encodeURIComponent(message)}`)
  }

  revalidatePath(`/articles/${articleSlug}`)
  revalidatePath('/moderation')
  redirect(`/articles/${articleSlug}?feedback=queued`)
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug)
  if (!article) return {}

  const url = absoluteUrl(`/articles/${article.slug}`)
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: url },
    keywords: ['TON', 'The Open Network', ...article.tags],
    openGraph: {
      type: 'article',
      siteName: SITE_NAME,
      title: article.title,
      description: article.excerpt,
      url,
      publishedTime: article.publishedAt,
      authors: [article.author],
      tags: article.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
    },
  }
}

export default async function ArticlePage({ params, searchParams }: ArticlePageProps) {
  const article = await getArticleBySlug(params.slug)
  if (!article) notFound()

  const user = await getCurrentUser()
  const approvedComments = await listComments({
    articleSlug: article.slug,
    status: 'approved',
  })
  const articleUrl = absoluteUrl(`/articles/${article.slug}`)
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    mainEntityOfPage: articleUrl,
    url: articleUrl,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: absoluteUrl('/'),
    },
    keywords: article.tags.join(', '),
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <header>
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-ink-500">
          {article.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-ink-50 px-2 py-0.5">
              {tag}
            </span>
          ))}
          <time dateTime={article.publishedAt}>{article.publishedAt}</time>
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink-900">
          {article.title}
        </h1>
        <p className="mt-4 text-lg text-ink-500">{article.excerpt}</p>
        <p className="mt-4 text-sm text-ink-500">By {article.author}</p>
      </header>

      <div className="mt-10 space-y-5 text-base leading-7 text-ink-700">
        {article.body.split('\n\n').map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <section className="mt-12 border-t border-ink-100 pt-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-2xl font-semibold tracking-tight text-ink-900">
            Discussion
          </h2>
          <p className="text-sm text-ink-500">
            {approvedComments.length} approved {approvedComments.length === 1 ? 'response' : 'responses'}
          </p>
        </div>

        {approvedComments.length > 0 ? (
          <ul className="mt-5 space-y-4">
            {approvedComments.map((comment) => (
              <li key={comment.id} className="rounded-md border border-ink-100 bg-white p-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-ink-500">
                  <span className="font-semibold text-ink-900">{comment.authorName}</span>
                  <span className="rounded-full bg-ink-50 px-2 py-0.5">
                    {feedbackLabels[comment.kind]}
                  </span>
                  <time dateTime={comment.submittedAt}>
                    {new Date(comment.submittedAt).toLocaleDateString()}
                  </time>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink-700">
                  {comment.body}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-md border border-ink-100 bg-white p-4 text-sm text-ink-500">
            No approved feedback yet.
          </p>
        )}
      </section>

      <section className="mt-10 rounded-md border border-ink-100 bg-white p-5">
        <h2 className="text-xl font-semibold tracking-tight text-ink-900">
          Add feedback
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          Comments and corrections are reviewed before publication.
        </p>

        {searchParams?.feedback === 'queued' ? (
          <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Thanks — your feedback is queued for moderation.
          </p>
        ) : null}
        {searchParams?.feedback_error ? (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {searchParams.feedback_error}
          </p>
        ) : null}

        {user ? (
          <form action={submitFeedback} className="mt-5 space-y-4">
            <input type="hidden" name="articleSlug" value={article.slug} />
            <div>
              <label htmlFor="kind" className="block text-sm font-medium text-ink-900">
                Feedback type
              </label>
              <select
                id="kind"
                name="kind"
                className="mt-1 w-full rounded-md border border-ink-100 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light"
              >
                {feedbackKinds.map((kind) => (
                  <option key={kind} value={kind}>
                    {feedbackLabels[kind]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="body" className="block text-sm font-medium text-ink-900">
                Feedback
              </label>
              <textarea
                id="body"
                name="body"
                required
                minLength={10}
                maxLength={1000}
                rows={5}
                className="mt-1 w-full rounded-md border border-ink-100 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light"
              />
            </div>
            <button
              type="submit"
              className="inline-flex rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Submit feedback
            </button>
          </form>
        ) : (
          <Link
            href={`/login?next=${encodeURIComponent(`/articles/${article.slug}`)}`}
            className="mt-5 inline-flex rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Sign in to comment
          </Link>
        )}
      </section>
    </article>
  )
}

export async function generateStaticParams() {
  const articles = await listPublishedArticles()
  return articles.map((article) => ({ slug: article.slug }))
}

#!/usr/bin/env node
import { promises as fs } from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const articlesSource = path.join(root, 'src', 'lib', 'articles.ts')
const reportsDir = path.join(root, 'reports')
const titleMin = 35
const titleMax = 70
const excerptMin = 80
const excerptMax = 180

async function main() {
  const source = await fs.readFile(articlesSource, 'utf8')
  const articles = extractArticles(source)
  const rows = articles.map(scoreArticle)
  const summary = {
    generatedAt: new Date().toISOString(),
    articleCount: rows.length,
    averageScore: Math.round(rows.reduce((total, row) => total + row.score, 0) / Math.max(rows.length, 1)),
    alertCount: rows.reduce((total, row) => total + row.alerts.length, 0),
    rows,
  }

  await fs.mkdir(reportsDir, { recursive: true })
  const reportPath = path.join(reportsDir, 'seo-report.json')
  await fs.writeFile(reportPath, JSON.stringify(summary, null, 2) + '\n', 'utf8')

  console.log(`SEO report: ${summary.articleCount} articles, average score ${summary.averageScore}, ${summary.alertCount} alerts`)
  console.log(`Wrote ${reportPath}`)
  if (summary.alertCount > 0) {
    for (const row of rows.filter((item) => item.alerts.length > 0)) {
      console.log(`- ${row.slug}: ${row.alerts.join('; ')}`)
    }
  }
}

function extractArticles(source) {
  const block = source.match(/SAMPLE_ARTICLES:\s*Article\[\]\s*=\s*\[([\s\S]*?)\]\n\n/)
  if (!block) throw new Error('Could not find SAMPLE_ARTICLES')
  const articles = []
  const objectPattern = /\{\s*slug:\s*'([^']+)',\s*title:\s*'([^']+)',\s*excerpt:\s*([\s\S]*?),\s*body:\s*([\s\S]*?),\s*author:\s*'([^']+)',\s*publishedAt:\s*'([^']+)',\s*tags:\s*\[([^\]]*)\],\s*\}/g
  let match
  while ((match = objectPattern.exec(block[1]))) {
    articles.push({
      slug: match[1],
      title: match[2],
      excerpt: cleanTsString(match[3]),
      body: cleanTsString(match[4]),
      author: match[5],
      publishedAt: match[6],
      tags: match[7]
        .split(',')
        .map((tag) => tag.trim().replace(/^'|'$/g, ''))
        .filter(Boolean),
    })
  }
  return articles
}

function scoreArticle(article) {
  const alerts = []
  if (article.title.length < titleMin) alerts.push(`title shorter than ${titleMin} characters`)
  if (article.title.length > titleMax) alerts.push(`title longer than ${titleMax} characters`)
  if (article.excerpt.length < excerptMin) alerts.push(`excerpt shorter than ${excerptMin} characters`)
  if (article.excerpt.length > excerptMax) alerts.push(`excerpt longer than ${excerptMax} characters`)
  if (article.body.length < 600) alerts.push('body is shorter than 600 characters')
  if (article.tags.length === 0) alerts.push('missing tags')
  if (!article.title.toLowerCase().includes('ton')) alerts.push('title does not include TON keyword')
  if (!/^[-a-z0-9]+$/.test(article.slug)) alerts.push('slug is not canonical')

  return {
    slug: article.slug,
    title: article.title,
    score: Math.max(0, 100 - alerts.length * 12),
    titleLength: article.title.length,
    excerptLength: article.excerpt.length,
    bodyLength: article.body.length,
    tags: article.tags,
    alerts,
  }
}

function cleanTsString(value) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .join('')
    .replace(/^'/, '')
    .replace(/',$/, '')
    .replace(/'$/, '')
    .replace(/'\s*\+\s*'/g, '')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

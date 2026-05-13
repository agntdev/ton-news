#!/usr/bin/env node
import { promises as fs } from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const outDir = path.join(root, 'ton-storage-export')
const articlesSource = path.join(root, 'src', 'lib', 'articles.ts')
const manifestPath = path.join(root, 'data', 'ton-storage-manifest.json')

async function main() {
  const [command, ...args] = process.argv.slice(2)
  if (command === 'export') {
    await exportArticles()
  } else if (command === 'register') {
    await registerBag(args)
  } else {
    console.error('Usage: ton-storage.mjs <export|register> [--bag-id HASH --gateway URL]')
    process.exit(1)
  }
}

async function exportArticles() {
  const source = await fs.readFile(articlesSource, 'utf8')
  const articles = extractArticles(source)
  const articlesDir = path.join(outDir, 'articles')
  await fs.rm(outDir, { recursive: true, force: true })
  await fs.mkdir(articlesDir, { recursive: true })

  for (const article of articles) {
    await fs.writeFile(
      path.join(articlesDir, `${article.slug}.json`),
      JSON.stringify(article, null, 2) + '\n',
      'utf8',
    )
  }

  await fs.writeFile(
    path.join(outDir, 'manifest.json'),
    JSON.stringify(
      articles.map(({ body, ...article }) => ({ ...article, path: `articles/${article.slug}.json` })),
      null,
      2,
    ) + '\n',
    'utf8',
  )

  console.log(`Exported ${articles.length} articles to ${outDir}`)
  console.log(`Next: storage-daemon create ${outDir} -d "Ton News articles"`)
}

async function registerBag(args) {
  const bagId = readFlag(args, '--bag-id')
  if (!bagId || !/^[a-fA-F0-9]{64}$/.test(bagId)) {
    throw new Error('register requires --bag-id with a 64-character hex BagID')
  }
  const gatewayUrl = readFlag(args, '--gateway')
  const manifest = JSON.parse(await fs.readFile(path.join(outDir, 'manifest.json'), 'utf8'))
  const refs = manifest.map((article) => ({
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    author: article.author,
    publishedAt: article.publishedAt,
    tags: article.tags,
    bagId,
    path: article.path,
    ...(gatewayUrl ? { gatewayUrl } : {}),
  }))

  await fs.mkdir(path.dirname(manifestPath), { recursive: true })
  await fs.writeFile(manifestPath, JSON.stringify(refs, null, 2) + '\n', 'utf8')
  console.log(`Registered ${refs.length} TON Storage article refs in ${manifestPath}`)
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

function readFlag(args, name) {
  const idx = args.indexOf(name)
  return idx === -1 ? undefined : args[idx + 1]
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

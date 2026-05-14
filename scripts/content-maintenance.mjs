#!/usr/bin/env node
import { promises as fs } from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const dataDir = path.join(root, 'data')
const backupsDir = path.join(root, 'backups')
const articlesPath = path.join(dataDir, 'articles.json')
const schedulePath = path.join(dataDir, 'content-schedule.json')
const trackedDataFiles = ['articles.json', 'submissions.json', 'comments.json', 'users.json']

async function main() {
  const [command, ...args] = process.argv.slice(2)
  if (command === 'backup') {
    await backup()
  } else if (command === 'restore') {
    await restore(args)
  } else if (command === 'publish-due') {
    await publishDue()
  } else {
    console.error('Usage: content-maintenance.mjs <backup|restore|publish-due> [--file backup.json]')
    process.exit(1)
  }
}

async function backup() {
  const snapshot = {
    version: 1,
    createdAt: new Date().toISOString(),
    files: {},
  }

  for (const filename of trackedDataFiles) {
    snapshot.files[filename] = await readJsonIfExists(path.join(dataDir, filename), [])
  }

  await fs.mkdir(backupsDir, { recursive: true })
  const backupPath = path.join(backupsDir, `content-${toStamp(snapshot.createdAt)}.json`)
  await fs.writeFile(backupPath, JSON.stringify(snapshot, null, 2) + '\n', 'utf8')
  console.log(`Created backup ${backupPath}`)
}

async function restore(args) {
  const file = readFlag(args, '--file')
  if (!file) {
    throw new Error('Restore requires --file <backup.json>')
  }

  const backupPath = path.resolve(root, file)
  const snapshot = JSON.parse(await fs.readFile(backupPath, 'utf8'))
  if (snapshot.version !== 1 || typeof snapshot.files !== 'object') {
    throw new Error('Unsupported backup format')
  }

  await fs.mkdir(dataDir, { recursive: true })
  for (const [filename, rows] of Object.entries(snapshot.files)) {
    if (!trackedDataFiles.includes(filename)) continue
    await fs.writeFile(path.join(dataDir, filename), JSON.stringify(rows, null, 2) + '\n', 'utf8')
  }
  console.log(`Restored content data from ${backupPath}`)
}

async function publishDue() {
  const now = new Date()
  const schedule = await readJsonIfExists(schedulePath, [])
  const storedArticles = await readJsonIfExists(articlesPath, [])
  const existingSlugs = new Set(storedArticles.map((article) => article.slug))
  const nextSchedule = []
  const dueArticles = []

  for (const item of schedule) {
    validateScheduleItem(item)
    if (item.status === 'published') {
      nextSchedule.push(item)
      continue
    }
    if (new Date(item.publishAt) > now) {
      nextSchedule.push(item)
      continue
    }
    if (!existingSlugs.has(item.slug)) {
      dueArticles.push({
        slug: item.slug,
        title: item.title,
        excerpt: item.excerpt,
        body: item.body,
        author: item.author,
        publishedAt: item.publishAt.slice(0, 10),
        tags: item.tags,
      })
      existingSlugs.add(item.slug)
    }
    nextSchedule.push({ ...item, status: 'published', publishedAt: new Date().toISOString() })
  }

  if (dueArticles.length === 0) {
    console.log('No scheduled content is due.')
    return
  }

  await fs.mkdir(dataDir, { recursive: true })
  await fs.writeFile(
    articlesPath,
    JSON.stringify([...dueArticles, ...storedArticles], null, 2) + '\n',
    'utf8',
  )
  await fs.writeFile(schedulePath, JSON.stringify(nextSchedule, null, 2) + '\n', 'utf8')
  console.log(`Published ${dueArticles.length} scheduled ${dueArticles.length === 1 ? 'article' : 'articles'}.`)
}

async function readJsonIfExists(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') return fallback
    throw error
  }
}

function validateScheduleItem(item) {
  const errors = []
  if (!item || typeof item !== 'object') {
    throw new Error('Invalid scheduled content item: item must be an object')
  }
  if (!/^[-a-z0-9_]+$/.test(item.slug ?? '')) errors.push('slug must be URL-friendly')
  if (!item.title || typeof item.title !== 'string') errors.push('title is required')
  if (!item.excerpt || typeof item.excerpt !== 'string') errors.push('excerpt is required')
  if (!item.body || typeof item.body !== 'string') errors.push('body is required')
  if (!item.author || typeof item.author !== 'string') errors.push('author is required')
  if (!Array.isArray(item.tags)) errors.push('tags must be an array')
  if (Number.isNaN(new Date(item.publishAt).getTime())) errors.push('publishAt must be an ISO date')
  if (errors.length) throw new Error(`Invalid scheduled content item: ${errors.join('; ')}`)
}

function readFlag(args, name) {
  const idx = args.indexOf(name)
  return idx === -1 ? undefined : args[idx + 1]
}

function toStamp(iso) {
  return iso.replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

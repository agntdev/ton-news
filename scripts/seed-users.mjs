#!/usr/bin/env node
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { randomBytes, scrypt as scryptCb } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCb)
const KEY_LEN = 64

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const key = await scrypt(password, salt, KEY_LEN)
  return `scrypt$${salt}$${key.toString('hex')}`
}

const usersPath = path.join(process.cwd(), 'data', 'users.json')

async function fileExists(p) {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

const seeds = [
  { username: 'moderator', email: 'moderator@ton-news.local', password: 'moderator-pass', role: 'moderator' },
  { username: 'author', email: 'author@ton-news.local', password: 'author-pass', role: 'author' },
]

async function main() {
  if (await fileExists(usersPath)) {
    console.log(`Users already seeded at ${usersPath}`)
    return
  }
  const users = []
  for (const s of seeds) {
    users.push({
      id: `usr_seed_${s.username}`,
      username: s.username,
      email: s.email,
      passwordHash: await hashPassword(s.password),
      role: s.role,
      createdAt: new Date().toISOString(),
    })
  }
  await fs.mkdir(path.dirname(usersPath), { recursive: true })
  await fs.writeFile(usersPath, JSON.stringify(users, null, 2) + '\n', 'utf8')
  console.log(`Seeded ${users.length} users to ${usersPath}`)
  console.log('Default moderator: moderator / moderator-pass')
  console.log('Default author:    author / author-pass')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

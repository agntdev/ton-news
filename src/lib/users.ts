import { promises as fs } from 'node:fs'
import { randomBytes } from 'node:crypto'
import path from 'node:path'
import { hashPassword, verifyPassword } from './passwords'

export interface UserRecord {
  id: string
  username: string
  email: string
  passwordHash: string
  role: 'reader' | 'author' | 'moderator'
  createdAt: string
}

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json')

async function readUsers(): Promise<UserRecord[]> {
  try {
    const raw = await fs.readFile(USERS_FILE, 'utf8')
    return JSON.parse(raw) as UserRecord[]
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw error
  }
}

async function writeUsers(users: UserRecord[]): Promise<void> {
  await fs.mkdir(path.dirname(USERS_FILE), { recursive: true })
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2) + '\n', 'utf8')
}

export async function listUsers(): Promise<UserRecord[]> {
  return readUsers()
}

export async function findUserByUsername(username: string): Promise<UserRecord | null> {
  const users = await readUsers()
  return users.find((u) => u.username.toLowerCase() === username.toLowerCase()) ?? null
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  const users = await readUsers()
  return users.find((u) => u.id === id) ?? null
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const users = await readUsers()
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null
}

export async function createUser(input: {
  username: string
  email: string
  password: string
  role?: 'reader' | 'author' | 'moderator'
}): Promise<UserRecord> {
  const users = await readUsers()
  if (users.some((u) => u.username.toLowerCase() === input.username.toLowerCase())) {
    throw new Error('Username already taken')
  }
  const record: UserRecord = {
    id: `usr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    username: input.username,
    email: input.email,
    passwordHash: await hashPassword(input.password),
    role: input.role ?? 'author',
    createdAt: new Date().toISOString(),
  }
  users.push(record)
  await writeUsers(users)
  return record
}

export async function authenticateUser(username: string, password: string): Promise<UserRecord | null> {
  const user = await findUserByUsername(username)
  if (!user) return null
  const ok = await verifyPassword(password, user.passwordHash)
  return ok ? user : null
}

export async function findOrCreateSocialUser(input: {
  provider: 'github'
  providerId: string
  username: string
  email?: string
}): Promise<UserRecord> {
  const email = input.email ?? `${input.provider}-${input.providerId}@ton-news.local`
  const existingByEmail = await findUserByEmail(email)
  if (existingByEmail) return existingByEmail

  const baseUsername = `${input.provider}-${input.username}`.toLowerCase().replace(/[^a-z0-9_-]/g, '-')
  const username = await uniqueUsername(baseUsername)
  return createUser({
    username,
    email,
    password: randomBytes(32).toString('hex'),
    role: 'author',
  })
}

async function uniqueUsername(base: string): Promise<string> {
  const users = await readUsers()
  const taken = new Set(users.map((user) => user.username.toLowerCase()))
  if (!taken.has(base)) return base
  for (let i = 2; i < 1000; i++) {
    const candidate = `${base}-${i}`
    if (!taken.has(candidate)) return candidate
  }
  throw new Error('Could not allocate social username')
}

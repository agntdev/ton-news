import { promises as fs } from 'node:fs'
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

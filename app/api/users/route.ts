import { getSession } from '@/lib/auth'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { hash } from 'bcryptjs'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!session.isAdmin) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const allUsers = await db
    .select({
      id: users.id,
      username: users.username,
      nickname: users.nickname,
      isAdmin: users.isAdmin,
      createdAt: users.createdAt,
    })
    .from(users)

  return Response.json(allUsers)
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!session.isAdmin) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { username, nickname, password, isAdmin } = body

  if (!username || !password) {
    return Response.json({ error: 'Username and password are required' }, { status: 400 })
  }

  if (username.length < 2 || username.length > 50) {
    return Response.json({ error: 'Username must be 2-50 characters' }, { status: 400 })
  }

  if (password.length < 6) {
    return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
  }

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))

  if (existing.length > 0) {
    return Response.json({ error: 'Username already exists' }, { status: 409 })
  }

  const passwordHash = await hash(password, 12)

  const [user] = await db
    .insert(users)
    .values({
      username,
      nickname: nickname || username,
      passwordHash,
      isAdmin: !!isAdmin,
    })
    .returning({
      id: users.id,
      username: users.username,
      nickname: users.nickname,
      isAdmin: users.isAdmin,
      createdAt: users.createdAt,
    })

  return Response.json(user, { status: 201 })
}

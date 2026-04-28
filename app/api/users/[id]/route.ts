import { getSession } from '@/lib/auth'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!session.isAdmin) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const userId = parseInt(id)

  if (isNaN(userId)) {
    return Response.json({ error: 'Invalid ID' }, { status: 400 })
  }

  const result = await db.select().from(users).where(eq(users.id, userId))
  const existing = result[0]
  if (!existing) {
    return Response.json({ error: 'User not found' }, { status: 404 })
  }

  const body = await request.json()
  const { isAdmin } = body

  if (typeof isAdmin !== 'boolean') {
    return Response.json({ error: 'isAdmin must be a boolean' }, { status: 400 })
  }

  // Prevent self-demotion
  if (userId === session.userId && !isAdmin) {
    return Response.json({ error: 'Cannot remove your own admin status' }, { status: 400 })
  }

  await db.update(users)
    .set({ isAdmin })
    .where(eq(users.id, userId))

  const updated = (await db
    .select({
      id: users.id,
      username: users.username,
      isAdmin: users.isAdmin,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId)))[0]

  return Response.json(updated)
}

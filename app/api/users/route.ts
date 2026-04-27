import { getSession } from '@/lib/auth'
import { db } from '@/db'
import { users } from '@/db/schema'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!session.isAdmin) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const allUsers = db
    .select({
      id: users.id,
      username: users.username,
      isAdmin: users.isAdmin,
      createdAt: users.createdAt,
    })
    .from(users)
    .all()

  return Response.json(allUsers)
}

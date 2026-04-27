import { verifyLogin, createSession, setSessionCookie } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return Response.json({ error: 'Username and password are required' }, { status: 400 })
    }

    const user = await verifyLogin(username, password)
    if (!user) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = await createSession(user.id)
    await setSessionCookie(token)

    return Response.json({
      success: true,
      user: { id: user.id, username: user.username, isAdmin: user.isAdmin },
    })
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }
}

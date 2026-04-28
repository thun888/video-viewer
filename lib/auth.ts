import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { cache } from 'react'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { compare } from 'bcryptjs'
import { redirect } from 'next/navigation'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

export interface SessionPayload {
  userId: number
  username: string
  nickname: string
  isAdmin: boolean
}

export async function createSession(userId: number): Promise<string> {
  const user = (await db
    .select({
      id: users.id,
      username: users.username,
      nickname: users.nickname,
      isAdmin: users.isAdmin,
    })
    .from(users)
    .where(eq(users.id, userId)))[0]

  if (!user) throw new Error('User not found')

  return new SignJWT({
    userId: user.id,
    username: user.username,
    nickname: user.nickname,
    isAdmin: user.isAdmin,
  } as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(SECRET)
}

export async function decryptSession(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export const getSession = cache(async (): Promise<SessionPayload | null> => {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  return decryptSession(token)
})

export async function verifyLogin(username: string, password: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
  const user = result[0]
  if (!user) return null
  const valid = await compare(password, user.passwordHash)
  return valid ? user : null
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

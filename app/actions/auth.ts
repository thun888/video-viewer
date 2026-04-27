'use server'

import { verifyLogin, createSession, setSessionCookie } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function login(_prevState: unknown, formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (!username || !password) {
    return { error: '请输入用户名和密码' }
  }

  const user = await verifyLogin(username, password)
  if (!user) {
    return { error: '用户名或密码错误' }
  }

  const token = await createSession(user.id)
  await setSessionCookie(token)

  redirect(user.isAdmin ? '/admin' : '/admin/videos')
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
  redirect('/login')
}

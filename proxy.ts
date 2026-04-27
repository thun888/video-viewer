import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

const PUBLIC_PREFIXES = ['/login', '/video/', '/d/', '/api/auth/login']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const sessionCookie = request.cookies.get('session')?.value
  if (!sessionCookie) {
    if (pathname.startsWith('/api/')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const { payload } = await jwtVerify(sessionCookie, SECRET)

    if (pathname.startsWith('/admin') && !payload.isAdmin) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', String(payload.userId))
    requestHeaders.set('x-user-role', (payload.isAdmin ? 'admin' : 'user') as string)

    return NextResponse.next({
      request: { headers: requestHeaders },
    })
  } catch {
    if (pathname.startsWith('/api/')) {
      return Response.json({ error: 'Invalid session' }, { status: 401 })
    }
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('session')
    return response
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|file.svg|globe.svg|next.svg|vercel.svg|window.svg).*)'],
}

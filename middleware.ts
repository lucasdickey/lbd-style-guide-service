import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Only protect the dashboard route
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    let authHeader = request.headers.get('authorization')

    // If no auth header, try to get credentials from cookie
    if (!authHeader) {
      const authCookie = request.cookies.get('auth')?.value
      if (authCookie) {
        authHeader = `Basic ${authCookie}`
      }
    }

    // Check if auth header exists
    if (!authHeader) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Basic auth: "Basic base64(username:password)"
    const base64Credentials = authHeader.replace('Basic ', '')
    let credentials: string

    try {
      credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8')
    } catch {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const [username, password] = credentials.split(':')
    const validUsername = process.env.DASHBOARD_USERNAME || 'admin'
    const validPassword = process.env.DASHBOARD_PASSWORD || 'change-me'

    if (username !== validUsername || password !== validPassword) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}

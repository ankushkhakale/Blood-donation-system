import { type NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Public routes that don't require auth
  const publicRoutes = ['/login', '/landing', '/']

  // Check for auth token
  const accessToken = request.cookies.get('sb-access-token')?.value

  // If user is not authenticated
  if (!accessToken) {
    // If trying to access protected route, redirect to landing
    if (!publicRoutes.includes(path) && !path.startsWith('/api')) {
      return NextResponse.redirect(new URL('/landing', request.url))
    }
    return NextResponse.next()
  }

  // If user is authenticated and tries to access login, redirect to dashboard
  if (accessToken && path === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

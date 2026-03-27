import { type NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Supabase auth here is client-managed; do not block routes based on missing cookies.
  // Server-side route protection should be implemented with @supabase/ssr if needed.
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

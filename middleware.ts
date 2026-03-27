import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export async function middleware(request: NextRequest) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser(request.cookies.get('sb-access-token')?.value)

  const path = request.nextUrl.pathname

  // Public routes that don't require auth
  const publicRoutes = ['/login', '/landing', '/']

  // If user is not authenticated
  if (!user) {
    // If trying to access protected route, redirect to landing
    if (!publicRoutes.includes(path) && !path.startsWith('/api')) {
      return NextResponse.redirect(new URL('/landing', request.url))
    }
    return NextResponse.next()
  }

  // If user is authenticated and tries to access login, redirect to dashboard
  if (user && path === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Get user profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Hospital admins cannot access donors page
  if (profile?.role === 'hospital_admin' && path === '/donors') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Only super_admin can access admin routes
  if (path.startsWith('/admin') && profile?.role !== 'super_admin') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

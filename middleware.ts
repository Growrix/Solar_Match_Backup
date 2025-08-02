import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession()

  // Protected routes that require authentication
  const protectedRoutes = ['/homeowner', '/installer', '/admin']
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  // If accessing a protected route without authentication, redirect to login
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If authenticated and trying to access login/signup, redirect to appropriate dashboard
  if (session && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup')) {
    // Determine user type and redirect accordingly
    try {
      // Check if user is an installer
      const { data: installer } = await supabase
        .from('installer_users')
        .select('id')
        .eq('id', session.user.id)
        .single()
      
      if (installer) {
        return NextResponse.redirect(new URL('/installer/dashboard', req.url))
      }

      // Default to homeowner dashboard
      return NextResponse.redirect(new URL('/homeowner/dashboard', req.url))
    } catch (error) {
      // If error determining user type, redirect to home
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // Role-based access control
  if (session && isProtectedRoute) {
    try {
      const userId = session.user.id
      
      // Check installer routes
      if (req.nextUrl.pathname.startsWith('/installer')) {
        const { data: installer } = await supabase
          .from('installer_users')
          .select('id')
          .eq('id', userId)
          .single()
        
        if (!installer) {
          return NextResponse.redirect(new URL('/homeowner/dashboard', req.url))
        }
      }
      
      // Check homeowner routes
      if (req.nextUrl.pathname.startsWith('/homeowner')) {
        const { data: installer } = await supabase
          .from('installer_users')
          .select('id')
          .eq('id', userId)
          .single()
        
        if (installer) {
          return NextResponse.redirect(new URL('/installer/dashboard', req.url))
        }
      }
    } catch (error) {
      console.error('Error in role-based access control:', error)
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
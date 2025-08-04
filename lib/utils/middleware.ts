import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { Database } from '@/types/database.types'

export interface AuthContext {
  user: Database['public']['Tables']['profiles']['Row'] | null
  isAuthenticated: boolean
  userType: 'homeowner' | 'installer' | null
}

// Create Supabase client for server-side authentication
function createSupabaseClient(request: NextRequest) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(_name: string, _value: string, _options: Record<string, unknown>) {
          // Variables are unused, consider removing or implementing functionality
        },
        remove(_name: string, _options: Record<string, unknown>) {
          // Variables are unused, consider removing or implementing functionality
        },
      },
    }
  )
}

// Verify authentication and return user context
export async function verifyAuth(request: NextRequest): Promise<AuthContext> {
  try {
    const supabase = createSupabaseClient(request)
    
    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return {
        user: null,
        isAuthenticated: false,
        userType: null
      }
    }
    
    // Get user profile with type information
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (profileError || !profile) {
      return {
        user: null,
        isAuthenticated: false,
        userType: null
      }
    }
    
    return {
      user: profile,
      isAuthenticated: true,
      userType: profile.user_type as 'homeowner' | 'installer'
    }
  } catch (error) {
    console.error('Auth verification error:', error)
    return {
      user: null,
      isAuthenticated: false,
      userType: null
    }
  }
}

// Middleware to require authentication
export function requireAuth(handler: (request: NextRequest, context: AuthContext) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authContext = await verifyAuth(request)
    
    if (!authContext.isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    return handler(request, authContext)
  }
}

// Middleware to require specific user type
export function requireUserType(userType: 'homeowner' | 'installer') {
  return function (handler: (request: NextRequest, context: AuthContext) => Promise<NextResponse>) {
    return async (request: NextRequest): Promise<NextResponse> => {
      const authContext = await verifyAuth(request)
      
      if (!authContext.isAuthenticated) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }
      
      if (authContext.userType !== userType) {
        return NextResponse.json(
          { error: `${userType} access required` },
          { status: 403 }
        )
      }
      
      return handler(request, authContext)
    }
  }
}

// Optional authentication (doesn't require auth but provides context if available)
export function optionalAuth(handler: (request: NextRequest, context: AuthContext) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authContext = await verifyAuth(request)
    return handler(request, authContext)
  }
}

// Helper to extract bearer token from request
export function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }
  return authHeader.slice(7)
}

// Create response with authentication headers
export function createAuthResponse(data: unknown, status: number = 200): NextResponse {
  const response = NextResponse.json(data, { status })
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  return response
}

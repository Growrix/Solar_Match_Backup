import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { UserRegistrationSchema, InstallerRegistrationSchema } from '@/lib/validation'
import { rateLimit, getClientIdentifier, createRateLimitHeaders, rateLimitConfigs } from '@/lib/utils/rateLimit'
import { createAuthResponse } from '@/lib/utils/middleware'
import type { Database } from '@/types/database.types'

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const clientId = getClientIdentifier(request)
    const rateLimitResult = rateLimit(clientId, rateLimitConfigs.auth)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { 
          status: 429,
          headers: createRateLimitHeaders(rateLimitResult)
        }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    
    // Determine registration type and validate accordingly
    let validatedData
    let userType: 'homeowner' | 'installer'
    
    if (body.userType === 'installer') {
      const validation = InstallerRegistrationSchema.safeParse(body)
      if (!validation.success) {
        return createAuthResponse(
          { 
            error: 'Invalid input data',
            details: validation.error.issues
          },
          400
        )
      }
      validatedData = validation.data
      userType = 'installer'
    } else {
      const validation = UserRegistrationSchema.safeParse(body)
      if (!validation.success) {
        return createAuthResponse(
          { 
            error: 'Invalid input data',
            details: validation.error.issues
          },
          400
        )
      }
      validatedData = validation.data
      userType = 'homeowner'
    }

    // Create Supabase client
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(_name: string, _value: string, _options: Record<string, unknown>) {
            // Handle cookie setting
          },
          remove(_name: string, _options: Record<string, unknown>) {
            // Handle cookie removal
          },
        },
      }
    )

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', validatedData.email)
      .single()

    if (existingUser) {
      return createAuthResponse(
        { error: 'An account with this email already exists' },
        400
      )
    }

    // Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          full_name: validatedData.fullName,
          user_type: userType,
          phone: validatedData.phone
        }
      }
    })

    if (authError) {
      console.error('Auth registration error:', authError)
      return createAuthResponse(
        { error: 'Failed to create account. Please try again.' },
        500
      )
    }

    if (!authData.user) {
      return createAuthResponse(
        { error: 'Registration failed. Please try again.' },
        500
      )
    }

    // Create profile record
    const profileData: Database['public']['Tables']['profiles']['Insert'] = {
      id: authData.user.id,
      email: validatedData.email,
      full_name: validatedData.fullName,
      phone: validatedData.phone || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert(profileData)

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Try to cleanup the auth user if profile creation failed
      await supabase.auth.admin.deleteUser(authData.user.id)
      
      return createAuthResponse(
        { error: 'Failed to complete registration. Please try again.' },
        500
      )
    }

    // For installers, create installer record separately
    if (userType === 'installer' && 'companyName' in validatedData) {
      const installerData = validatedData as typeof validatedData & {
        companyName: string
        abn: string
        certificationLevel: string
        serviceAreas: string[]
      }
      
      const { error: installerError } = await supabase
        .from('installers')
        .insert({
          id: authData.user.id,
          company_name: installerData.companyName,
          contact_name: validatedData.fullName,
          email: validatedData.email,
          phone: validatedData.phone || '',
          license_number: installerData.abn,
          service_areas: installerData.serviceAreas,
          verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (installerError) {
        console.error('Installer record creation error:', installerError)
        // Continue anyway - profile was created successfully
      }
    }

    // Return success response
    const response = createAuthResponse({
      message: 'Registration successful! Please check your email to verify your account.',
      user: {
        id: authData.user.id,
        email: validatedData.email,
        fullName: validatedData.fullName,
        userType: userType
      }
    }, 201)

    // Add rate limit headers
    Object.entries(createRateLimitHeaders(rateLimitResult)).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response

  } catch (error) {
    console.error('Registration API error:', error)
    return createAuthResponse(
      { error: 'Internal server error. Please try again later.' },
      500
    )
  }
}

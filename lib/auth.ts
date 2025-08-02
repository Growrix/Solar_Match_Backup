import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

export interface AuthResponse {
  user: User | null
  session: Session | null
  error: Error | null
}

export interface SignUpData {
  email: string
  password: string
  fullName?: string
}

export interface SignInData {
  email: string
  password: string
}

export interface InstallerSignUpData {
  email: string
  password: string
  companyName: string
  contactName: string
  phone: string
}

export interface InstallerSignInData {
  email: string
  password: string
}

// HOMEOWNER AUTHENTICATION FUNCTIONS
export const signUpHomeowner = async ({ email, password, fullName }: SignUpData): Promise<AuthResponse> => {
  try {
    // Validate inputs
    if (!email || !email.trim()) {
      throw new Error('Email address is required')
    }
    
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long')
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName?.trim() || null,
          user_type: 'homeowner',
        }
      }
    })

    if (error) {
      console.error('Supabase signup error:', error)
      throw error
    }

    return {
      user: data.user,
      session: data.session,
      error: null
    }
  } catch (error: any) {
    console.error('Homeowner signup error:', error)
    return {
      user: null,
      session: null,
      error: error as Error
    }
  }
}

export const signInHomeowner = async ({ email, password }: SignInData): Promise<AuthResponse> => {
  try {
    // Validate inputs
    if (!email || !email.trim()) {
      throw new Error('Email address is required')
    }
    
    if (!password || !password.trim()) {
      throw new Error('Password is required')
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      console.error('Supabase signin error:', error)
      throw error
    }

    return {
      user: data.user,
      session: data.session,
      error: null
    }
  } catch (error: any) {
    console.error('Homeowner signin error:', error)
    return {
      user: null,
      session: null,
      error: error as Error
    }
  }
}

// INSTALLER AUTHENTICATION FUNCTIONS
export const signUpInstaller = async ({ email, password, companyName, contactName, phone }: InstallerSignUpData): Promise<AuthResponse> => {
  try {
    // Validate inputs
    if (!email || !email.trim()) {
      throw new Error('Email address is required')
    }
    
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long')
    }

    if (!companyName || !companyName.trim()) {
      throw new Error('Company name is required')
    }

    if (!contactName || !contactName.trim()) {
      throw new Error('Contact name is required')
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: contactName.trim(),
          user_type: 'installer',
          company_name: companyName.trim(),
          phone: phone?.trim() || null
        }
      }
    })

    if (error) {
      console.error('Supabase installer signup error:', error)
      throw error
    }

    return {
      user: data.user,
      session: data.session,
      error: null
    }
  } catch (error: any) {
    console.error('Installer signup error:', error)
    return {
      user: null,
      session: null,
      error: error as Error
    }
  }
}

export const signInInstaller = async ({ email, password }: InstallerSignInData): Promise<AuthResponse> => {
  try {
    // Validate inputs
    if (!email || !email.trim()) {
      throw new Error('Email address is required')
    }
    
    if (!password || !password.trim()) {
      throw new Error('Password is required')
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      console.error('Supabase installer signin error:', error)
      throw error
    }

    return {
      user: data.user,
      session: data.session,
      error: null
    }
  } catch (error: any) {
    console.error('Installer signin error:', error)
    return {
      user: null,
      session: null,
      error: error as Error
    }
  }
}

// SHARED FUNCTIONS
export const signOut = async (): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    return { error: null }
  } catch (error) {
    console.error('Sign out error:', error)
    return { error: error as Error }
  }
}

export const getCurrentSession = async (): Promise<Session | null> => {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const resetPassword = async (email: string): Promise<{ error: Error | null }> => {
  try {
    if (!email || !email.trim()) {
      throw new Error('Email address is required')
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Reset password error:', error)
    return { error: error as Error }
  }
}

export const updatePassword = async (password: string): Promise<{ error: Error | null }> => {
  try {
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long')
    }

    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Update password error:', error)
    return { error: error as Error }
  }
}

export const onAuthStateChange = (callback: (event: string, session: Session | null) => void) => {
  return supabase.auth.onAuthStateChange(callback)
}
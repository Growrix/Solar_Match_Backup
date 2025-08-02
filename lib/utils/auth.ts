import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: Error | null;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface InstallerSignUpData {
  email: string;
  password: string;
  companyName: string;
  contactName: string;
  phone: string;
}

export interface InstallerSignInData {
  email: string;
  password: string;
}

// HOMEOWNER AUTHENTICATION FUNCTIONS
export const signUpHomeowner = async ({ email, password, fullName }: SignUpData): Promise<AuthResponse> => {
  try {
    // Validate inputs
    if (!email || !email.trim()) {
      throw new Error('Email address is required');
    }
    
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
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
    });

    if (error) {
      console.error('Supabase signup error:', error);
      throw error;
    }

    // Create homeowner profile
    if (data.user) {
      const { error: profileError } = await supabase
        .rpc('create_homeowner_user', {
          user_id: data.user.id,
          user_email: data.user.email!,
          full_name: fullName?.trim() || null
        });

      if (profileError) {
        console.error('Error creating homeowner profile:', profileError);
        // Don't throw error here, just log it - user can still sign up
      }

      // Set homeowner flag
      localStorage.setItem('user_type', 'homeowner');
      console.log('Homeowner user type set in localStorage');
    }

    return {
      user: data.user,
      session: data.session,
      error: null
    };
  } catch (error: any) {
    console.error('Homeowner signup error:', error);
    return {
      user: null,
      session: null,
      error: error as Error
    };
  }
};

export const signInHomeowner = async ({ email, password }: SignInData): Promise<AuthResponse> => {
  try {
    // Validate inputs
    if (!email || !email.trim()) {
      throw new Error('Email address is required');
    }
    
    if (!password || !password.trim()) {
      throw new Error('Password is required');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      console.error('Supabase signin error:', error);
      throw error;
    }

    // Verify this is a homeowner account
    if (data.user) {
      const { data: isHomeowner, error: checkError } = await supabase
        .rpc('check_homeowner_user', { user_id: data.user.id });

      if (checkError) {
        console.error('Error checking homeowner status:', checkError);
        throw new Error('Error verifying homeowner status');
      }

      if (!isHomeowner) {
        // Sign out the user since they're not a homeowner
        await supabase.auth.signOut();
        throw new Error('This account is not registered as a homeowner. Please use the installer sign-in if you have an installer account.');
      }

      // Set homeowner flag
      localStorage.setItem('user_type', 'homeowner');
      console.log('Homeowner signed in, user type set in localStorage');
    }

    return {
      user: data.user,
      session: data.session,
      error: null
    };
  } catch (error: any) {
    console.error('Homeowner signin error:', error);
    return {
      user: null,
      session: null,
      error: error as Error
    };
  }
};

// INSTALLER AUTHENTICATION FUNCTIONS
export const signUpInstaller = async ({ email, password, companyName, contactName, phone }: InstallerSignUpData): Promise<AuthResponse> => {
  try {
    // Validate inputs
    if (!email || !email.trim()) {
      throw new Error('Email address is required');
    }
    
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    if (!companyName || !companyName.trim()) {
      throw new Error('Company name is required');
    }

    if (!contactName || !contactName.trim()) {
      throw new Error('Contact name is required');
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
    });

    if (error) {
      console.error('Supabase installer signup error:', error);
      throw error;
    }

    // Create installer account using the database function
    if (data.user) {
      const { data: installerResult, error: installerError } = await supabase
        .rpc('create_installer_user', {
          user_id: data.user.id,
          user_email: email.trim(),
          company_name: companyName.trim(),
          contact_name: contactName.trim(),
          phone_number: phone?.trim() || null
        });

      if (installerError) {
        console.error('Error creating installer account:', installerError);
        throw new Error('Failed to create installer account');
      }

      if (!installerResult?.success) {
        throw new Error(installerResult?.message || 'Failed to create installer account');
      }

      // Set installer flag
      localStorage.setItem('user_type', 'installer');
      localStorage.setItem('installer_signup_data', JSON.stringify({
        companyName: companyName.trim(),
        contactName: contactName.trim(),
        phone: phone?.trim() || null,
        email: email.trim()
      }));
    }

    return {
      user: data.user,
      session: data.session,
      error: null
    };
  } catch (error: any) {
    console.error('Installer signup error:', error);
    return {
      user: null,
      session: null,
      error: error as Error
    };
  }
};

export const signInInstaller = async ({ email, password }: InstallerSignInData): Promise<AuthResponse> => {
  try {
    // Validate inputs
    if (!email || !email.trim()) {
      throw new Error('Email address is required');
    }
    
    if (!password || !password.trim()) {
      throw new Error('Password is required');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      console.error('Supabase installer signin error:', error);
      throw error;
    }

    // Verify this is an installer account
    if (data.user) {
      const { data: isInstaller, error: checkError } = await supabase
        .rpc('check_installer_user', { user_id: data.user.id });

      if (checkError) {
        console.error('Error checking installer status:', checkError);
        throw new Error('Error verifying installer status');
      }

      if (!isInstaller) {
        // Sign out the user since they're not an installer
        await supabase.auth.signOut();
        throw new Error('This account is not registered as an installer. Please use the regular sign-in if you have a homeowner account.');
      }

      // Set installer flag
      localStorage.setItem('user_type', 'installer');
    }

    return {
      user: data.user,
      session: data.session,
      error: null
    };
  } catch (error: any) {
    console.error('Installer signin error:', error);
    return {
      user: null,
      session: null,
      error: error as Error
    };
  }
};

// SHARED FUNCTIONS
export const signOut = async (): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Clear all user type data and force reload
    localStorage.removeItem('user_type');
    localStorage.removeItem('installer_signup_data');
    localStorage.removeItem('installer_remember_me');
    
    // Clear any cached profile data
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('profile_picture_')) {
        localStorage.removeItem(key);
      }
    });
    
    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error: error as Error };
  }
};

export const getCurrentSession = async (): Promise<Session | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const resetPassword = async (email: string): Promise<{ error: Error | null }> => {
  try {
    if (!email || !email.trim()) {
      throw new Error('Email address is required');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Reset password error:', error);
    return { error: error as Error };
  }
};

export const updatePassword = async (password: string): Promise<{ error: Error | null }> => {
  try {
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Update password error:', error);
    return { error: error as Error };
  }
};

export const onAuthStateChange = (callback: (event: string, session: Session | null) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};

// Helper function to determine user type from localStorage
export const getUserType = (): 'homeowner' | 'installer' | null => {
  return localStorage.getItem('user_type') as 'homeowner' | 'installer' | null;
};

// Helper function to check if current user is homeowner
export const isHomeowner = (): boolean => {
  return getUserType() === 'homeowner';
};

// Helper function to check if current user is installer
export const isInstaller = (): boolean => {
  return getUserType() === 'installer';
};

// Helper function to clear user type and force re-authentication
export const clearUserType = (): void => {
  localStorage.removeItem('user_type');
  localStorage.removeItem('installer_signup_data');
  localStorage.removeItem('installer_remember_me');
};
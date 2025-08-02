import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing');
  throw new Error('Missing Supabase environment variables. Please check your .env file and restart the development server.');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  console.error('Invalid Supabase URL:', supabaseUrl);
  throw new Error('Invalid Supabase URL format. Please check your VITE_SUPABASE_URL environment variable.');
}

// Create Supabase client with enhanced configuration
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'solarmatch-web@1.0.0'
    },
    fetch: (url, options = {}) => {
      return fetch(url, {
        ...options,
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Connection health check function with improved error handling
export const checkConnection = async (): Promise<{ connected: boolean; error?: string }> => {
  try {
    // Simple ping to check if Supabase is reachable
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .abortSignal(controller.signal);

    clearTimeout(timeoutId);

    if (error) {
      console.warn('Supabase query error:', error.message);
      
      // Handle specific error types
      if (error.message?.includes('JWT') || error.message?.includes('auth')) {
        return { connected: true, error: 'Authentication issue - please sign in again' };
      }
      
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        return { connected: false, error: 'Network connection failed. Please check your internet connection.' };
      }
      
      // For other errors, still consider connected but with a warning
      return { connected: true, error: `Database warning: ${error.message}` };
    }

    return { connected: true };
  } catch (error) {
    console.warn('Supabase connection check failed:', error);
    
    // Handle different error types gracefully
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        return { connected: false, error: 'Connection timeout. Supabase may be temporarily unavailable.' };
      }
      
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        return { connected: false, error: 'Network error. Please check your internet connection and try again.' };
      }
      
      if (error.message.includes('CORS')) {
        return { connected: false, error: 'CORS error. Please check your Supabase configuration.' };
      }
    }
    
    return { 
      connected: false, 
      error: 'Unable to connect to database. Please try again later.' 
    };
  }
};

// Helper function to get the current user with error handling
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
    return user;
  } catch (error) {
    console.error('Failed to get current user:', error);
    throw error;
  }
};

// Helper function to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return false;
  }
};

// Connection monitoring with improved error handling
export const monitorConnection = () => {
  // Monitor auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session?.user?.email);
    
    if (event === 'SIGNED_IN') {
      console.log('User signed in successfully');
    } else if (event === 'SIGNED_OUT') {
      console.log('User signed out');
    } else if (event === 'TOKEN_REFRESHED') {
      console.log('Auth token refreshed');
    }
  });

  // Periodic connection health check with exponential backoff
  let checkInterval = 5 * 60 * 1000; // Start with 5 minutes
  let consecutiveFailures = 0;
  
  const healthCheck = async () => {
    try {
      const { connected, error } = await checkConnection();
      
      if (!connected) {
        consecutiveFailures++;
        console.warn(`Supabase connection issue (attempt ${consecutiveFailures}):`, error);
        
        // Exponential backoff: increase interval on consecutive failures
        checkInterval = Math.min(checkInterval * 1.5, 30 * 60 * 1000); // Max 30 minutes
      } else {
        // Reset on successful connection
        if (consecutiveFailures > 0) {
          console.log('Supabase connection restored');
          consecutiveFailures = 0;
          checkInterval = 5 * 60 * 1000; // Reset to 5 minutes
        }
      }
    } catch (error) {
      consecutiveFailures++;
      console.warn('Health check failed:', error);
    }
    
    // Schedule next check
    setTimeout(healthCheck, checkInterval);
  };

  // Initial health check with delay to avoid immediate errors on page load
  setTimeout(healthCheck, 2000);
};

// Initialize connection monitoring when module loads (only in browser)
if (typeof window !== 'undefined') {
  // Delay initialization to avoid blocking page load
  setTimeout(() => {
    monitorConnection();
  }, 1000);
}

// Export types for convenience
export type { Database } from '@/types/database.types';
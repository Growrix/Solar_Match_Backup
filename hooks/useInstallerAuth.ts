import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useAuth } from '@/hooks/useAuth';
import { supabase, checkConnection } from '@/lib/supabase';

export interface InstallerAuthState {
  user: User | null;
  isInstaller: boolean;
  loading: boolean;
  installerData: any | null;
  error: string | null;
}

export const useInstallerAuth = (): InstallerAuthState => {
  const authState = useAuth();
  const [installerData, setInstallerData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Safely extract user and loading from authState with fallbacks
  const user = authState?.user || null;
  const authLoading = authState?.loading ?? true;
  const userType = authState?.userType;

  // Determine if user is installer based on userType
  const isInstallerUser = userType === 'installer';

  useEffect(() => {
    const fetchInstallerData = async () => {
      if (!user || !isInstallerUser) {
        setInstallerData(null);
        setError(null);
        setLoading(false);
        return;
      }

      try {
        setError(null);
        setLoading(true);
        
        // First check if Supabase is properly configured
        if (!supabase) {
          throw new Error('Supabase client not initialized');
        }

        // Skip connection check for now and try direct query
        console.log('Attempting to fetch installer data for user:', user.id);

        // Add timeout to the query to prevent hanging
        const queryPromise = supabase
          .from('installer_users')
          .select(`
            *,
            installer_companies (
              id,
              company_name,
              email,
              phone,
              verified
            )
          `)
          .eq('id', user.id)
          .maybeSingle();

        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Query timeout - please check your connection')), 10000);
        });

        // Race between query and timeout
        const { data: installerInfo, error: dataError } = await Promise.race([
          queryPromise,
          timeoutPromise
        ]) as any;

        if (dataError) {
          console.error('Supabase query error:', dataError);
          
          // Handle specific error types
          if (dataError.code === 'PGRST116' || dataError.message?.includes('No rows found')) {
            setError('No installer profile found. Please contact support to set up your installer account.');
          } else if (dataError.message?.includes('JWT')) {
            setError('Authentication expired. Please sign in again.');
          } else if (dataError.message?.includes('Failed to fetch') || dataError.message?.includes('fetch')) {
            setError('Unable to connect to Supabase. Please check your internet connection and Supabase configuration.');
          } else {
            setError(`Database error: ${dataError.message}`);
          }
          setInstallerData(null);
        } else {
          setInstallerData(installerInfo);
          setError(null);
        }
      } catch (error) {
        console.error('Error in installer data fetch:', error);
        
        // More specific error handling
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          setError('Unable to connect to Supabase. Please check your .env file configuration and restart the development server.');
        } else if (error instanceof Error) {
          if (error.message.includes('timeout')) {
            setError('Request timed out. Please check your connection and try again.');
          } else if (error.message.includes('Missing Supabase environment variables')) {
            setError('Supabase configuration missing. Please check your .env file and restart the development server.');
          } else {
            setError(`Error: ${error.message}`);
          }
        } else {
          setError('An unexpected error occurred while fetching installer data.');
        }
        
        setInstallerData(null);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if auth is not loading and we have the necessary data
    if (!authLoading) {
      fetchInstallerData();
    } else {
      setLoading(true);
    }
  }, [user, isInstallerUser, authLoading]);

  return {
    user,
    isInstaller: isInstallerUser,
    loading: authLoading || loading,
    installerData,
    error
  };
};
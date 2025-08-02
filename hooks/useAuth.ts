import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export type UserType = 'homeowner' | 'installer' | 'admin' | null;

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userType: UserType;
}

export const useAuth = (): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<UserType>(null);

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const role = await detectUserType(session.user.id);
        setUserType(role);
      }

      setLoading(false);
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) detectUserType(session.user.id).then(setUserType);
      else setUserType(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const detectUserType = async (userId: string): Promise<UserType> => {
    const { data: admin } = await supabase.from('admin_users').select('id').eq('id', userId).single();
    if (admin) return 'admin';

    const { data: homeowner } = await supabase.from('profiles').select('id').eq('id', userId).single();
    if (homeowner) return 'homeowner';

    const { data: installer } = await supabase.from('installer_users').select('id').eq('id', userId).single();
    if (installer) return 'installer';

    return null;
  };

  return { user, session, loading, userType };
};
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  isPro: boolean;
  trialEndDate: string;
  proExpiryDate: string | null;
}

interface AuthContextType {
  user: User | null;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateSubscription: (status: boolean) => Promise<void>;
  isLoaded: boolean;
  supabaseUser: SupabaseUser | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchProfile = async (uid: string, email: string, createdAt: string, metadata: any) => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', uid)
          .single();

        if (error) {
          // PGRST116 is "no rows found", but we also check for missing table
          const isTableMissing = error.message?.includes('public.profiles') && error.message?.includes('not found');
          
          if (isTableMissing) {
            console.warn('⚠️ Supabase "profiles" table is missing. Please run the SQL schema in your Supabase dashboard to enable cloud sync.');
          } else if (error.code !== 'PGRST116') {
            console.error('Supabase profile fetch error:', error.message || error);
          }
          
          const defaultProfile = {
            id: uid,
            email: email,
            name: metadata.full_name || email.split('@')[0],
            createdAt: createdAt,
            isPro: false,
            trialEndDate: new Date(new Date(createdAt).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            proExpiryDate: null
          };

          // If profile doesn't exist, try to create it
          if (error.code === 'PGRST116') {
            supabase.from('profiles').insert([{
              id: uid,
              is_pro: false,
              trial_end_date: defaultProfile.trialEndDate,
              pro_expiry_date: null
            }]).then(({ error: insertError }) => {
              if (insertError) console.warn('Could not auto-create profile record:', insertError.message);
            });
          }

          return defaultProfile;
        }

        return {
          id: uid,
          email: email,
          name: metadata.full_name || email.split('@')[0],
          createdAt: createdAt,
          isPro: profile.is_pro,
          trialEndDate: profile.trial_end_date,
          proExpiryDate: profile.pro_expiry_date
        };
      } catch (e) {
        console.error('Failed to fetch profile', e);
        return null;
      }
    };

    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSupabaseUser(session?.user ?? null);
      
      if (session?.user) {
        const profile = await fetchProfile(
          session.user.id, 
          session.user.email!, 
          session.user.created_at,
          session.user.user_metadata
        );
        setUser(profile);
      } else {
        setUser(null);
      }
      setIsLoaded(true);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const profile = await fetchProfile(
            session.user.id, 
            session.user.email!, 
            session.user.created_at,
            session.user.user_metadata
          );
          setUser(profile);
        }
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const refreshProfile = async () => {
    if (supabaseUser) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();
      
      if (profile) {
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email!,
          name: supabaseUser.user_metadata.full_name || supabaseUser.email!.split('@')[0],
          createdAt: supabaseUser.created_at,
          isPro: profile.is_pro,
          trialEndDate: profile.trial_end_date,
          proExpiryDate: profile.pro_expiry_date
        });
      }
    }
  };

  const updateSubscription = async (status: boolean) => {
    if (supabaseUser) {
      const { error } = await supabase
        .from('profiles')
        .update({ is_pro: status })
        .eq('id', supabaseUser.id);
      
      if (!error) {
        await refreshProfile();
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, logout, refreshProfile, updateSubscription, isLoaded, supabaseUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

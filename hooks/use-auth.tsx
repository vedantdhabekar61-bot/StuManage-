'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  createdAt: string;
  subscription: {
    status: 'trial' | 'active' | 'expired';
    expiryDate: string;
    planPrice: number;
  } | null;
}

interface AuthContextType {
  user: User | null;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateSubscription: (status: string) => Promise<void>;
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
        // Fetch owner profile
        const { data: owner, error: ownerError } = await supabase
          .from('owners')
          .select('*')
          .eq('id', uid)
          .single();

        if (ownerError) {
          console.error('Supabase owner fetch error:', ownerError.message);
          return null;
        }

        // Fetch subscription
        const { data: subscription, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('owner_id', uid)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        return {
          id: uid,
          email: email,
          name: owner.name || metadata.full_name || email.split('@')[0],
          phone: owner.phone || '',
          createdAt: createdAt,
          subscription: subscription ? {
            status: subscription.status,
            expiryDate: subscription.expiry_date,
            planPrice: subscription.plan_price
          } : null
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
      const { data: owner } = await supabase
        .from('owners')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();
      
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('owner_id', supabaseUser.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (owner) {
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email!,
          name: owner.name || supabaseUser.user_metadata.full_name || supabaseUser.email!.split('@')[0],
          phone: owner.phone || '',
          createdAt: supabaseUser.created_at,
          subscription: subscription ? {
            status: subscription.status,
            expiryDate: subscription.expiry_date,
            planPrice: subscription.plan_price
          } : null
        });
      }
    }
  };

  const updateSubscription = async (status: string) => {
    if (supabaseUser) {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: status })
        .eq('owner_id', supabaseUser.id);
      
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

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
    const ensureProfileExists = async (uid: string, email: string, metadata: any) => {
      try {
        // Fetch owner profile
        let { data: owner, error: ownerError } = await supabase
          .from('owners')
          .select('*')
          .eq('id', uid)
          .maybeSingle();

        if (ownerError) {
          console.error('Supabase owner fetch error:', ownerError.message);
        }

        // If owner doesn't exist, create it
        if (!owner) {
          const { data: newOwner, error: createError } = await supabase
            .from('owners')
            .upsert([{
              id: uid,
              email: email,
              name: metadata.full_name || email.split('@')[0],
              phone: '',
            }], { onConflict: 'id' })
            .select()
            .maybeSingle();
          
          if (createError) {
            console.error('Failed to create/upsert owner profile:', createError.message);
          } else if (newOwner) {
            owner = newOwner;
          }
        }

        // Fetch subscription
        let { data: subscription, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('owner_id', uid)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (subError) {
          console.error('Supabase subscription fetch error:', subError.message);
        }

        // If subscription doesn't exist, create a trial
        if (!subscription) {
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 30); // 30 days trial

          const { data: newSub, error: createSubError } = await supabase
            .from('subscriptions')
            .upsert([{
              owner_id: uid,
              status: 'trial',
              expiry_date: expiryDate.toISOString(),
              plan_price: 0
            }], { onConflict: 'owner_id' })
            .select()
            .maybeSingle();
          
          if (createSubError) {
            console.error('Failed to create/upsert trial subscription:', createSubError.message);
          } else if (newSub) {
            subscription = newSub;
          }
        }

        return { owner, subscription };
      } catch (e) {
        console.error('Error in ensureProfileExists:', e);
        return { owner: null, subscription: null };
      }
    };

    const fetchProfile = async (uid: string, email: string, createdAt: string, metadata: any) => {
      const { owner, subscription } = await ensureProfileExists(uid, email, metadata);
      
      if (!owner) {
        console.error('Critical: Could not ensure owner profile exists. Blocking auth to prevent data corruption.');
        return null;
      }
      
      return {
        id: uid,
        email: email,
        name: owner?.name || metadata.full_name || email.split('@')[0],
        phone: owner?.phone || '',
        createdAt: createdAt,
        subscription: subscription ? {
          status: subscription.status,
          expiryDate: subscription.expiry_date,
          planPrice: subscription.plan_price
        } : null
      };
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
      // Ensure profile exists even during refresh
      const { data: owner } = await supabase
        .from('owners')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();
      
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('owner_id', supabaseUser.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email!,
        name: owner?.name || supabaseUser.user_metadata.full_name || supabaseUser.email!.split('@')[0],
        phone: owner?.phone || '',
        createdAt: supabaseUser.created_at,
        subscription: subscription ? {
          status: subscription.status,
          expiryDate: subscription.expiry_date,
          planPrice: subscription.plan_price
        } : null
      });
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

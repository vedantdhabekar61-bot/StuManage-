'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
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
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const lastUid = localStorage.getItem('last_auth_uid');
      if (lastUid) {
        const cached = localStorage.getItem(`auth_profile_${lastUid}`);
        if (cached) {
          try {
            return JSON.parse(cached);
          } catch (e) {
            console.error('Failed to parse initial cached profile', e);
          }
        }
      }
    }
    return null;
  });
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(() => {
    if (typeof window !== 'undefined') {
      const lastUid = localStorage.getItem('last_auth_uid');
      if (lastUid && localStorage.getItem(`auth_profile_${lastUid}`)) {
        return true;
      }
    }
    return false;
  });

  // Remove the useEffect that was doing the same thing

  const ensureProfileExists = useCallback(async (uid: string, email: string, metadata: any) => {
    try {
      // Fetch owner profile and subscription in parallel
      const [ownerResult, subResult] = await Promise.all([
        supabase.from('owners').select('*').eq('id', uid).maybeSingle(),
        supabase.from('subscriptions').select('*').eq('owner_id', uid).order('created_at', { ascending: false }).limit(1).maybeSingle()
      ]);

      let owner = ownerResult.data;
      let subscription = subResult.data;

      // If owner doesn't exist, create it
      if (!owner && !ownerResult.error) {
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
          console.error('Failed to create owner profile:', createError.message);
        } else if (newOwner) {
          owner = newOwner;
        }
      }

      // If subscription doesn't exist, create a trial
      if (!subscription && !subResult.error) {
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
          console.error('Failed to create trial subscription:', createSubError.message);
        } else if (newSub) {
          subscription = newSub;
        }
      }

      return { owner, subscription };
    } catch (e) {
      console.error('Error in ensureProfileExists:', e);
      return { owner: null, subscription: null };
    }
  }, []);

  const fetchProfile = useCallback(async (uid: string, email: string, createdAt: string, metadata: any) => {
    const { owner, subscription } = await ensureProfileExists(uid, email, metadata);
    
    if (!owner) {
      console.error('Critical: Could not ensure owner profile exists.');
      return null;
    }
    
    const profile: User = {
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

    // Cache profile
    localStorage.setItem(`auth_profile_${uid}`, JSON.stringify(profile));
    localStorage.setItem('last_auth_uid', uid);
    
    return profile;
  }, [ensureProfileExists]);

  const initAuth = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const sUser = session?.user ?? null;
      setSupabaseUser(sUser);
      
      if (sUser) {
        // We already tried to load from cache in the initializer.
        // Now we fetch the fresh profile in the background.
        const profile = await fetchProfile(
          sUser.id, 
          sUser.email!, 
          sUser.created_at,
          sUser.user_metadata
        );
        
        if (profile) {
          setUser(profile);
        }
      } else {
        setUser(null);
        localStorage.removeItem('last_auth_uid');
      }
    } catch (e) {
      console.error('Error in initAuth:', e);
    } finally {
      setIsLoaded(true);
    }
  }, [fetchProfile]);

  useEffect(() => {
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const sUser = session?.user ?? null;
      setSupabaseUser(sUser);
      
      if (sUser) {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const profile = await fetchProfile(
            sUser.id, 
            sUser.email!, 
            sUser.created_at,
            sUser.user_metadata
          );
          if (profile) {
            setUser(profile);
          }
          setIsLoaded(true);
        }
      } else {
        setUser(null);
        setIsLoaded(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [initAuth, fetchProfile]);

  const logout = async () => {
    await supabase.auth.signOut();
    if (supabaseUser) {
      localStorage.removeItem(`auth_profile_${supabaseUser.id}`);
    }
    localStorage.removeItem('last_auth_uid');
    setUser(null);
  };

  const refreshProfile = async () => {
    if (supabaseUser) {
      const profile = await fetchProfile(
        supabaseUser.id, 
        supabaseUser.email!, 
        supabaseUser.created_at,
        supabaseUser.user_metadata
      );
      if (profile) {
        setUser(profile);
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

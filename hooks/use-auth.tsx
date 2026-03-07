'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  isSubscribed: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, name: string) => void; // Legacy/Demo login
  logout: () => Promise<void>;
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
    // Check active sessions and subscribe to auth changes
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSupabaseUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch profile from public.profiles table if it exists
        // For now, we'll still use localStorage for the extended profile data 
        // until we set up the database tables
        const savedUser = localStorage.getItem('libmanager_user');
        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser);
            setUser(parsed);
          } catch (e) {
            console.error('Failed to parse user', e);
          }
        } else {
          // Create a default profile if none exists
          const newUser: User = {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata.full_name || session.user.email!.split('@')[0],
            createdAt: session.user.created_at,
            isSubscribed: false
          };
          setUser(newUser);
          localStorage.setItem('libmanager_user', JSON.stringify(newUser));
        }
      } else {
        // Fallback to legacy local-only user if no supabase session
        const savedUser = localStorage.getItem('libmanager_user');
        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser);
            setUser(parsed);
          } catch (e) {
            console.error('Failed to parse user', e);
          }
        }
      }
      setIsLoaded(true);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user ?? null);
      if (!session) {
        setUser(null);
        localStorage.removeItem('libmanager_user');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = (email: string, name: string) => {
    const newUser: User = { 
      id: Math.random().toString(36).substr(2, 9),
      email, 
      name, 
      createdAt: new Date().toISOString(),
      isSubscribed: false 
    };
    setUser(newUser);
    localStorage.setItem('libmanager_user', JSON.stringify(newUser));
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('libmanager_user');
  };

  const updateSubscription = async (status: boolean) => {
    if (user) {
      const updatedUser = { ...user, isSubscribed: status };
      setUser(updatedUser);
      localStorage.setItem('libmanager_user', JSON.stringify(updatedUser));
      
      // If we had a profiles table, we'd update it here:
      // await supabase.from('profiles').update({ is_subscribed: status }).eq('id', user.id);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateSubscription, isLoaded, supabaseUser }}>
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

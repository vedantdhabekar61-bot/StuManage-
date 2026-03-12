'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.search);
      if (error) {
        console.error('Error exchanging code for session:', error.message);
        router.push('/login'); // Redirect back to login on failure so the user isn't stuck
        return;
      }
      
      // Force Next.js to re-evaluate the layout with the new session
      router.refresh(); 
      router.push('/');
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="text-sm font-medium text-slate-500">Completing sign in...</p>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AlertCircle } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for error in URL
    const params = new URLSearchParams(window.location.search);
    const errorDesc = params.get('error_description') || params.get('error');
    if (errorDesc) {
      setError(decodeURIComponent(errorDesc));
      return;
    }

    // Supabase client automatically handles the OAuth callback in the URL.
    // We just need to wait for the session to be established.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || session) {
        router.push('/');
      }
    });

    // Also check if we already have a session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setError(error.message);
      } else if (session) {
        router.push('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="rounded-full bg-rose-100 p-3 text-rose-600">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Authentication Error</h2>
          <p className="text-sm text-slate-500">{error}</p>
          <button 
            onClick={() => router.push('/login')}
            className="mt-4 rounded-2xl bg-teal-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-teal-100 transition-all active:scale-95"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
        <p className="text-sm font-bold tracking-widest uppercase text-slate-400">Completing sign in...</p>
      </div>
    </div>
  );
}

'use client';

import { useSubscription } from '@/hooks/use-subscription';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2, Lock } from 'lucide-react';

const PUBLIC_PATHS = ['/login', '/signup', '/billing', '/trial', '/payment', '/auth/callback'];

export function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const { isActive, loading } = useSubscription();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (!loading && !isActive && !isPublicPath) {
      router.push('/billing');
    }
  }, [loading, isActive, isPublicPath, router]);

  if (loading && !isPublicPath) {
    return null; // Let AuthGuard handle the initial spinner
  }

  if (!isActive && !isPublicPath) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white p-8 text-center">
        <div className="mb-6 rounded-full bg-rose-50 p-6 text-rose-600">
          <Lock className="h-12 w-12" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-slate-900">Subscription Expired</h1>
        <p className="mb-8 text-slate-500">
          Your free trial or subscription has ended. Please pay ₹50 to continue using DeskTracker Pro.
        </p>
        <button
          onClick={() => router.push('/billing')}
          className="w-full rounded-2xl bg-indigo-600 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-indigo-200 transition-all active:scale-95"
        >
          Go to Billing
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

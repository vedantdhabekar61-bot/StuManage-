'use client';

import { useSubscription } from '@/hooks/use-subscription';
import { useAuth } from '@/hooks/use-auth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2, Lock } from 'lucide-react';

const PUBLIC_PATHS = ['/login', '/auth', '/billing', '/trial', '/payment', '/auth/callback', '/privacy', '/terms'];

export function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoaded: authLoaded } = useAuth();
  const { isActive, loading: subLoading } = useSubscription();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicPath = PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`));
  const loading = !authLoaded || subLoading;

  useEffect(() => {
    // Only redirect to billing if user is logged in but subscription is inactive
    if (!loading && user && !isActive && !isPublicPath) {
      router.push('/billing');
    }
  }, [loading, user, isActive, isPublicPath, router]);

  if (loading && !isPublicPath) {
    return null; // Let AuthGuard handle the initial spinner
  }

  // Return null while redirecting to billing if subscription is expired
  if (user && !isActive && !isPublicPath) {
    return null;
  }

  return <>{children}</>;
}

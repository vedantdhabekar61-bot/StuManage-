import { useSubscription } from '@/hooks/use-subscription';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { useEffect } from 'react';

const PUBLIC_PATHS = ['/login', '/auth', '/billing', '/trial', '/auth/callback', '/privacy', '/terms'];

export function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoaded: authLoaded } = useAuth();
  const { isActive, loading: subLoading } = useSubscription();
  const [pathname, navigate] = useLocation();
  const isPublicPath = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(`${p}/`));
  const loading = !authLoaded || subLoading;

  useEffect(() => {
    if (!loading && user && !isActive && !isPublicPath) navigate('/billing');
  }, [loading, user, isActive, isPublicPath, navigate]);

  if (loading && !isPublicPath) return null;
  if (user && !isActive && !isPublicPath) return null;
  return <>{children}</>;
}

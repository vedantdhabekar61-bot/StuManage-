'use client';

import { useAuth } from '@/hooks/use-auth';
import { useSubscription } from '@/hooks/use-subscription';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { WelcomeScreen } from './welcome-screen';
import { SubscriptionModal } from './subscription-modal';
import { AnimatePresence, motion } from 'motion/react';
import { Activity } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useAuth();
  const { isActive } = useSubscription();
  const router = useRouter();
  const pathname = usePathname();
  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hasSeenWelcome') === 'true';
    }
    return false;
  });

  const handleDismissWelcome = () => {
    setHasSeenWelcome(true);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  useEffect(() => {
    if (isLoaded && (hasSeenWelcome || user)) {
      const isAuthPage = pathname === '/login' || pathname === '/signup';
      if (!user && !isAuthPage) {
        router.push('/signup');
      } else if (user && isAuthPage) {
        router.push('/');
      }
    }
  }, [user, isLoaded, pathname, router, hasSeenWelcome]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFBF7]">
        <Activity className="h-10 w-10 animate-spin text-[#0ea495]" />
        <p className="mt-4 text-sm font-medium text-slate-500">Loading your space...</p>
      </div>
    );
  }

  const showWelcome = !hasSeenWelcome && !user;
  const showPaywall = user && !isActive && pathname !== '/billing' && pathname !== '/payment' && pathname !== '/trial';

  return (
    <AnimatePresence mode="wait">
      {showWelcome ? (
        <motion.div
          key="welcome"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: 'blur(5px)' }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed inset-0 z-[300]"
        >
          <WelcomeScreen onDismiss={handleDismissWelcome} />
        </motion.div>
      ) : showPaywall ? (
        <motion.div
          key="paywall"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[400]"
        >
          <SubscriptionModal />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { WelcomeScreen } from './welcome-screen';
import { AnimatePresence, motion } from 'motion/react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean | null>(null);

  useEffect(() => {
    const seen = localStorage.getItem('hasSeenWelcome');
    // If user is already logged in, we can skip welcome screen for a faster experience
    setTimeout(() => {
      if (seen === 'true' || user) {
        setHasSeenWelcome(true);
        if (!seen && user) localStorage.setItem('hasSeenWelcome', 'true');
      } else {
        setHasSeenWelcome(false);
      }
    }, 0);
  }, [user]);

  useEffect(() => {
    if (isLoaded && hasSeenWelcome === true) {
      const isAuthPage = pathname === '/login' || pathname === '/signup';
      if (!user && !isAuthPage) {
        router.push('/signup');
      } else if (user && isAuthPage) {
        router.push('/');
      }
    }
  }, [user, isLoaded, pathname, router, hasSeenWelcome]);

  if (isLoaded === false || hasSeenWelcome === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {!hasSeenWelcome ? (
        <motion.div
          key="welcome"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: 'blur(5px)' }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed inset-0 z-[300]"
        >
          <WelcomeScreen onDismiss={() => setHasSeenWelcome(true)} />
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

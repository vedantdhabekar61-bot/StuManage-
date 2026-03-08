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
    setTimeout(() => setHasSeenWelcome(!!seen), 0);
  }, []);

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
          exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[300]"
        >
          <WelcomeScreen onDismiss={() => setHasSeenWelcome(true)} />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="min-h-screen"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

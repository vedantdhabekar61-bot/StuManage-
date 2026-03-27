'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { WelcomeScreen } from './welcome-screen';
import { AnimatePresence, motion } from 'motion/react';
import { Activity } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useAuth();
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

  if (isLoaded === false) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFBF7]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
          className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-[#0ea495] text-white shadow-2xl shadow-[#0ea495]/20"
        >
          <Activity className="h-10 w-10" />
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex flex-col items-center gap-1"
        >
          <h2 className="text-lg font-bold text-[#1C1917]">StuManage app</h2>
          <p className="text-xs font-semibold text-[#78716C] uppercase tracking-widest">Loading your space...</p>
        </motion.div>
      </div>
    );
  }

  const showWelcome = !hasSeenWelcome && !user;

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

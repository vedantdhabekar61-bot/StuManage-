import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { useEffect, useState } from 'react';
import { WelcomeScreen } from './welcome-screen';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useAuth();
  const [pathname, navigate] = useLocation();
  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean>(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('hasSeenWelcome') === 'true';
    return false;
  });

  const handleDismissWelcome = () => {
    setHasSeenWelcome(true);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  useEffect(() => {
    if (isLoaded && (hasSeenWelcome || user)) {
      const publicPaths = ['/login', '/auth', '/privacy', '/terms'];
      const isPublicPage = publicPaths.some(p => pathname === p || pathname.startsWith(`${p}/`));
      if (!user && !isPublicPage) navigate('/login');
      else if (user && (pathname === '/login' || pathname === '/auth' || pathname.startsWith('/auth/'))) navigate('/');
    }
  }, [user, isLoaded, pathname, navigate, hasSeenWelcome]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFBF7]">
        <Activity className="h-10 w-10 animate-spin text-[#0ea495]" />
        <p className="mt-4 text-sm font-medium text-slate-500">Loading your space...</p>
      </div>
    );
  }

  const publicPaths = ['/login', '/auth', '/privacy', '/terms'];
  const isPublicPage = publicPaths.some(p => pathname === p || pathname.startsWith(`${p}/`));
  const showWelcome = !hasSeenWelcome && !user && (pathname === '/' || pathname === '/login' || pathname === '/auth');

  if (!user && !isPublicPage && !showWelcome) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFBF7]">
        <Activity className="h-10 w-10 animate-spin text-[#0ea495]" />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {showWelcome ? (
        <motion.div key="welcome" initial={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.05, filter: 'blur(5px)' }} transition={{ duration: 0.4, ease: 'easeOut' }} className="fixed inset-0 z-[300]">
          <WelcomeScreen onDismiss={handleDismissWelcome} />
        </motion.div>
      ) : (
        <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="min-h-screen">
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type SnackbarType = 'success' | 'error' | 'info';

interface SnackbarContextType {
  show: (message: string, type?: SnackbarType) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [snackbar, setSnackbar] = useState<{ message: string; type: SnackbarType } | null>(null);

  const show = useCallback((message: string, type: SnackbarType = 'success') => {
    setSnackbar({ message, type });
    setTimeout(() => {
      setSnackbar(null);
    }, 4000);
  }, []);

  return (
    <SnackbarContext.Provider value={{ show }}>
      {children}
      <AnimatePresence>
        {snackbar && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-24 left-1/2 z-[1001] w-[90%] max-w-sm"
          >
            <div className={cn(
              "flex items-center gap-3 px-6 py-4 rounded-3xl shadow-2xl border backdrop-blur-md",
              snackbar.type === 'success' && "bg-[#1C1917] text-white border-white/10",
              snackbar.type === 'error' && "bg-rose-600 text-white border-rose-500",
              snackbar.type === 'info' && "bg-teal-600 text-white border-teal-500"
            )}>
              {snackbar.type === 'success' && <CheckCircle2 className="h-5 w-5 text-teal-400 shrink-0" />}
              {snackbar.type === 'error' && <AlertCircle className="h-5 w-5 text-white shrink-0" />}
              {snackbar.type === 'info' && <Info className="h-5 w-5 text-white shrink-0" />}
              
              <p className="text-sm font-bold tracking-tight line-clamp-2">
                {snackbar.message}
              </p>
              
              <button 
                onClick={() => setSnackbar(null)}
                className="ml-auto p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
}

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, ArrowRight, Sparkles } from 'lucide-react';

export function WelcomeScreen() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-[#fdfcf8] p-6"
      >
        <div className="relative flex h-full w-full max-w-md flex-col items-center justify-center gap-12 text-center">
          {/* Background Accents */}
          <div className="absolute top-1/4 left-1/2 -z-10 h-64 w-64 -translate-x-1/2 rounded-full bg-amber-100/30 blur-3xl" />
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center gap-6"
          >
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-600 shadow-inner">
                <BookOpen className="h-10 w-10" />
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -right-2 -top-2 text-amber-400"
              >
                <Sparkles className="h-6 w-6" />
              </motion.div>
            </div>
            
            <div className="flex flex-col gap-3">
              <h1 className="font-serif text-5xl font-light tracking-tight text-slate-900">
                Welcome to <span className="font-medium italic">LibManager</span>
              </h1>
              <p className="mx-auto max-w-[280px] text-sm leading-relaxed text-slate-500">
                A quiet space for focused minds. Manage your reading room with elegance and ease.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex w-full flex-col gap-4"
          >
            <button
              onClick={handleDismiss}
              className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-slate-900 py-5 text-sm font-bold uppercase tracking-widest text-white transition-all active:scale-95"
            >
              <span className="relative z-10">Enter Workspace</span>
              <ArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" />
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-amber-500/20 to-transparent transition-transform group-hover:translate-x-0" />
            </button>
            
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Crafted for Productivity
            </p>
          </motion.div>

          {/* Quote Accent */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-12 font-serif text-sm italic text-slate-400"
          >
            &quot;The only thing that you absolutely have to know, is the location of the library.&quot;
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

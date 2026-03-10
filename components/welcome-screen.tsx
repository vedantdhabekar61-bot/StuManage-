'use client';

import { motion } from 'motion/react';
import { Activity, ArrowRight, Sparkles } from 'lucide-react';

export function WelcomeScreen({ onDismiss }: { onDismiss?: () => void }) {
  const handleDismiss = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    if (onDismiss) onDismiss();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-50 p-6">
      <div className="relative flex w-full max-w-md flex-col items-center gap-8 rounded-[2.5rem] bg-white p-10 shadow-2xl shadow-slate-200 text-center">
        {/* Logo Section */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-4"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
            <Activity className="h-10 w-10" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Smart Tracking
            </h1>
            <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">
              Welcome to Version 1.0
            </p>
          </div>
        </motion.div>

        {/* Features List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="flex flex-col gap-4 w-full text-left"
        >
          <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900">Smart Tracking</span>
              <span className="text-xs text-slate-500">Manage seats and fees effortlessly.</span>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <ArrowRight className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900">Quick Actions</span>
              <span className="text-xs text-slate-500">WhatsApp reminders in one click.</span>
            </div>
          </div>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="w-full"
        >
          <button
            onClick={handleDismiss}
            className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-indigo-600 py-5 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-95"
          >
            <span>Get Started</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>

        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
          Secure & Private Management
        </p>
      </div>
    </div>
  );
}

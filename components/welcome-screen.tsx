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
      <div className="relative flex w-full max-w-md flex-col items-center gap-8 rounded-[3rem] bg-white p-10 shadow-2xl shadow-slate-200 text-center border border-white">
        {/* Logo Section */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-6"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-teal-500 text-white shadow-2xl shadow-teal-100">
            <Activity className="h-12 w-12" />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              StuManage <span className="text-teal-500">app</span>
            </h1>
            <p className="text-xs font-bold text-slate-300 uppercase tracking-[0.3em]">
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
          <div className="flex items-center gap-5 rounded-3xl bg-slate-50 p-5 border border-slate-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-500 border border-teal-100">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900">Smart Management</span>
              <span className="text-xs font-medium text-slate-400">Manage seats and fees effortlessly.</span>
            </div>
          </div>
          <div className="flex items-center gap-5 rounded-3xl bg-slate-50 p-5 border border-slate-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500 border border-emerald-100">
              <ArrowRight className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900">Quick Actions</span>
              <span className="text-xs font-medium text-slate-400">WhatsApp reminders in one click.</span>
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
            className="group flex w-full items-center justify-center gap-3 rounded-[2rem] bg-teal-500 py-6 text-sm font-bold uppercase tracking-widest text-white shadow-xl shadow-teal-100 transition-all hover:bg-teal-600 active:scale-95"
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

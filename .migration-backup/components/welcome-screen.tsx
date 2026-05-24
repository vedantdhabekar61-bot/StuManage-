'use client';
import { motion } from 'motion/react';
import { ArrowRight, GraduationCap, Bell, ShieldCheck, Users } from 'lucide-react';

export function WelcomeScreen({ onDismiss }: { onDismiss?: () => void }) {
  const handleDismiss = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    if (onDismiss) onDismiss();
  };

  return (
    <div
      // Using 100dvh ensures it fits perfectly on mobile browsers, accounting for address bars
      className="fixed inset-0 z-[200] flex flex-col bg-teal-500 overflow-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Top hero section - Now flexible instead of fixed to 52% */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Decorative blobs */}
        <div className="absolute -top-16 -left-16 h-56 w-56 rounded-full bg-teal-400/40" />
        <div className="absolute top-8 -right-10 h-36 w-36 rounded-full bg-teal-600/30" />
        <div className="absolute bottom-10 right-12 h-24 w-24 rounded-full bg-white/10" />

        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 mb-6 flex flex-col items-center gap-5"
        >
          {/* Stacked rings logo mark */}
          <div className="relative flex items-center justify-center">
            <div className="absolute h-32 w-32 rounded-full bg-white/10" />
            <div className="absolute h-24 w-24 rounded-full bg-white/20" />
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-xl shadow-teal-900/20">
              <GraduationCap className="h-8 w-8 text-teal-500" strokeWidth={2.2} />
            </div>
          </div>
        </motion.div>

        {/* Brand name */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="relative z-10 flex flex-col items-center gap-2"
        >
          <h1 className="text-4xl font-extrabold tracking-tight text-white" style={{ letterSpacing: '-0.02em' }}>
            StuManage
          </h1>
          <span className="rounded-full bg-teal-600/50 border border-teal-400/30 px-4 py-1 text-xs font-semibold tracking-wider text-white">
            v1.0 • Student Management
          </span>
        </motion.div>
      </div>

      {/* Bottom Content Sheet */}
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200, delay: 0.1 }}
        className="flex flex-col rounded-t-[2.5rem] bg-white px-6 pb-8 pt-10 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
      >
        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="flex flex-col gap-4 mb-8"
        >
          {[
            {
              icon: <Users className="h-5 w-5" />,
              color: 'bg-teal-50 text-teal-600',
              title: 'Smart Management',
              desc: 'Manage seats and fees effortlessly',
            },
            {
              icon: <Bell className="h-5 w-5" />,
              color: 'bg-emerald-50 text-emerald-600',
              title: 'Quick Actions',
              desc: 'WhatsApp reminders in one click',
            },
            {
              icon: <ShieldCheck className="h-5 w-5" />,
              color: 'bg-slate-50 text-slate-600',
              title: 'Secure & Private',
              desc: 'Your data stays on your device',
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 + i * 0.1, duration: 0.5 }}
              className="flex items-center gap-4 rounded-2xl bg-slate-50/50 p-3 hover:bg-slate-50 transition-colors"
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${item.color}`}>
                {item.icon}
              </div>
              <div className="flex-1">
                <p className="text-base font-bold text-slate-800">{item.title}</p>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Sticky CTA Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.6 }}
          className="mt-auto"
        >
          <button
            onClick={handleDismiss}
            className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-teal-500 py-4 shadow-lg shadow-teal-500/30 active:scale-[0.98] transition-all"
          >
            {/* Shimmer */}
            <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]" />
            <span className="text-lg font-bold text-white">Get Started</span>
            <ArrowRight className="ml-2 h-5 w-5 text-white transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}


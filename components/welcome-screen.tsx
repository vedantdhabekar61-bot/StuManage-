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
      className="fixed inset-0 z-[200] flex flex-col bg-white"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Top hero section with teal background */}
      <div className="relative flex flex-col items-center justify-end bg-teal-500 pb-16 pt-20 px-6 overflow-hidden"
        style={{ flex: '0 0 52%' }}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-16 -left-16 h-56 w-56 rounded-full bg-teal-400/40" />
        <div className="absolute top-8 -right-10 h-36 w-36 rounded-full bg-teal-600/30" />
        <div className="absolute bottom-0 right-12 h-24 w-24 rounded-full bg-white/10" />

        {/* Logo — mortarboard icon instead of Activity waveform */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 mb-8 flex flex-col items-center gap-5"
        >
          {/* Stacked rings logo mark */}
          <div className="relative flex items-center justify-center">
            <div className="absolute h-28 w-28 rounded-full bg-white/20" />
            <div className="absolute h-20 w-20 rounded-full bg-white/20" />
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg shadow-teal-700/30">
              <GraduationCap className="h-7 w-7 text-teal-500" strokeWidth={2.2} />
            </div>
          </div>
        </motion.div>

        {/* Brand name */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="relative z-10 flex flex-col items-center gap-1"
        >
          <h1 className="text-4xl font-extrabold tracking-tight text-white" style={{ letterSpacing: '-0.02em' }}>
            StuManage
          </h1>
          <span className="rounded-full bg-white/20 px-4 py-0.5 text-xs font-bold uppercase tracking-widest text-white/80">
            v1.0 • Student Management
          </span>
        </motion.div>
      </div>

      {/* Bottom content section */}
      <div className="flex flex-1 flex-col justify-between px-6 pt-8 pb-8">
        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="flex flex-col gap-3"
        >
          {[
            {
              icon: <Users className="h-5 w-5" />,
              color: 'bg-teal-50 text-teal-600 border-teal-100',
              title: 'Smart Management',
              desc: 'Manage seats and fees effortlessly',
            },
            {
              icon: <Bell className="h-5 w-5" />,
              color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
              title: 'Quick Actions',
              desc: 'WhatsApp reminders in one click',
            },
            {
              icon: <ShieldCheck className="h-5 w-5" />,
              color: 'bg-slate-50 text-slate-500 border-slate-100',
              title: 'Secure & Private',
              desc: 'Your data stays on your device',
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 + i * 0.1, duration: 0.5 }}
              className="flex items-center gap-4 rounded-2xl bg-white px-4 py-3.5 shadow-sm border border-slate-100"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${item.color}`}>
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{item.title}</p>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-slate-300" />
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.6 }}
          className="mt-6"
        >
          <button
            onClick={handleDismiss}
            className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-teal-500 py-4 shadow-lg shadow-teal-200 active:scale-95 transition-transform"
          >
            {/* Shimmer */}
            <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]" />
            <span className="text-sm font-extrabold uppercase tracking-[0.15em] text-white">Get Started</span>
            <ArrowRight className="ml-3 h-4 w-4 text-white transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
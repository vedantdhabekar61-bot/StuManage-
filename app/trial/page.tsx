'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Users, 
  Bell, 
  BarChart3, 
  ChevronRight,
  ArrowLeft,
  Lock
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function TrialPage() {
  const router = useRouter();
  const { updateSubscription } = useAuth();
  const [isStarting, setIsStarting] = useState(false);

  const handleStartTrial = async () => {
    setIsStarting(true);
    // In a real app, we'd save the trial start date in the database
    await updateSubscription(true);
    setTimeout(() => {
      router.push('/');
    }, 800);
  };

  const benefits = [
    {
      title: "Track Student Fees",
      subtitle: "फीस का हिसाब रखें",
      icon: <Zap className="h-5 w-5 text-amber-500" />
    },
    {
      title: "Manual Fee Reminders",
      subtitle: "व्हाट्सएप पर रिमाइंडर भेजें",
      icon: <Bell className="h-5 w-5 text-indigo-500" />
    },
    {
      title: "Attendance Management",
      subtitle: "हाजिरी लगाना हुआ आसान",
      icon: <Users className="h-5 w-5 text-emerald-500" />
    },
    {
      title: "Simple Monthly Reports",
      subtitle: "महीने की पूरी रिपोर्ट देखें",
      icon: <BarChart3 className="h-5 w-5 text-rose-500" />
    }
  ];

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Banner / Image Area */}
      <div className="relative h-64 bg-indigo-600 overflow-hidden flex items-center justify-center p-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
        </div>
        
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 flex flex-col items-center text-center text-white"
        >
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-md shadow-xl">
            <ShieldCheck className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">DeskTracker Pro</h1>
          <p className="text-indigo-100 font-medium mt-1">Smart Student Management</p>
        </motion.div>
      </div>

      {/* Content Area */}
      <div className="flex-1 -mt-8 relative z-20 bg-slate-50 rounded-t-[2.5rem] px-6 pt-10 pb-32">
        <div className="max-w-md mx-auto flex flex-col gap-8">
          {/* Heading Section */}
          <div className="text-center flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-slate-900">Start Your 1 Month Free Trial</h2>
            <p className="text-slate-500 font-medium">Manage students, track fees and send reminders easily.</p>
            <p className="text-slate-400 text-xs mt-1">विद्यार्थियों और फीस का प्रबंधन अब और भी आसान।</p>
          </div>

          {/* Pricing Highlight Card */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-[2rem] p-6 flex items-center justify-between shadow-sm">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Pricing</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-indigo-600">₹50</span>
                <span className="text-sm font-bold text-indigo-400">/ month</span>
              </div>
              <span className="text-[10px] font-bold text-indigo-300 mt-1">AFTER 30 DAYS TRIAL</span>
            </div>
            <div className="h-12 w-px bg-indigo-100" />
            <div className="flex flex-col items-end text-right">
              <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                1st Month FREE
              </span>
              <span className="text-[10px] text-slate-400 mt-2 italic">Cancel anytime</span>
            </div>
          </div>

          {/* Benefits List */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">Key Benefits</h3>
            <div className="grid gap-3">
              {benefits.map((benefit, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
                    {benefit.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800">{benefit.title}</span>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">{benefit.subtitle}</span>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 ml-auto" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Trust Message */}
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <Lock className="h-3 w-3" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Cancel anytime. No hidden charges.</span>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pt-10">
        <div className="max-w-md mx-auto">
          <button 
            onClick={handleStartTrial}
            disabled={isStarting}
            className="w-full bg-indigo-600 text-white rounded-2xl py-5 text-sm font-bold uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isStarting ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Start Free Trial
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
          <p className="text-center text-[10px] text-slate-400 mt-4 font-medium">
            1000+ Teachers already using DeskTracker
          </p>
        </div>
      </div>
    </main>
  );
}

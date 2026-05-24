import { useState } from 'react';
import { useLocation } from 'wouter';
import { CheckCircle2, Lock, BarChart3, Bell, Users, Zap, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { Logo } from '@/components/logo';

export default function TrialPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [isStarting, setIsStarting] = useState(false);

  const handleStartTrial = async () => {
    setIsStarting(true);
    setTimeout(() => { navigate('/'); setIsStarting(false); }, 500);
  };

  const benefits = [
    { icon: <Zap className="h-5 w-5 text-amber-500" />, title: "Unlimited Students", subtitle: "असीमित विद्यार्थी जोड़ें" },
    { icon: <Bell className="h-5 w-5 text-teal-500" />, title: "Manual Fee Reminders", subtitle: "व्हाट्सएप पर रिमाइंडर भेजें" },
    { icon: <Users className="h-5 w-5 text-emerald-500" />, title: "Manage 100+ Students", subtitle: "सारे विद्यार्थियों का रिकॉर्ड रखें" },
    { icon: <BarChart3 className="h-5 w-5 text-rose-500" />, title: "Simple Monthly Reports", subtitle: "महीने की पूरी रिपोर्ट देखें" },
  ];

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <div className="relative h-72 bg-teal-500 overflow-hidden flex items-center justify-center p-8">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
        </div>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 flex flex-col items-center text-center text-white">
          <Logo size={96} variant="glass" className="mb-6" />
          <h1 className="text-4xl font-black tracking-tighter uppercase">Stu<span className="text-teal-100">Manage</span></h1>
          <p className="text-teal-50 font-medium mt-2 opacity-80 uppercase tracking-widest text-[10px]">Study Smart. Manage Better.</p>
        </motion.div>
      </div>
      <div className="flex-1 -mt-10 relative z-20 bg-slate-50 rounded-t-[3rem] px-6 pt-12 pb-40 border-t border-white">
        <div className="max-w-md mx-auto flex flex-col gap-10">
          <div className="text-center flex flex-col gap-3">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome, {user?.name?.split(' ')[0] || 'Friend'}!</h2>
            <p className="text-slate-400 font-medium leading-relaxed">Your 30-day free trial has started. Manage students, track fees and send reminders easily.</p>
          </div>
          <div className="bg-white border border-white rounded-[2.5rem] p-8 flex items-center justify-between shadow-xl shadow-slate-200/50">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Your Plan</span>
              <div className="flex items-baseline gap-1 mt-1"><span className="text-3xl font-bold text-teal-500 tracking-tight">FREE</span></div>
              <span className="text-[10px] font-bold text-teal-500 mt-2 tracking-widest uppercase">30 DAYS TRIAL</span>
            </div>
            <div className="h-16 w-px bg-slate-100" />
            <div className="flex flex-col items-end text-right">
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100">Then ₹50/mo</span>
              <span className="text-[10px] font-medium text-slate-400 mt-3 italic">Cancel anytime</span>
            </div>
          </div>
          <div className="grid gap-4">
            {benefits.map((benefit, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="flex items-center gap-5 bg-white p-5 rounded-3xl shadow-sm border border-white">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100">{benefit.icon}</div>
                <div className="flex flex-col"><span className="text-sm font-bold text-slate-800">{benefit.title}</span><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{benefit.subtitle}</span></div>
                <div className="ml-auto h-6 w-6 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100"><CheckCircle2 className="h-4 w-4 text-emerald-500" /></div>
              </motion.div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-300"><Lock className="h-3 w-3" /><span className="text-[10px] font-bold uppercase tracking-[0.2em]">No payment required for trial</span></div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-6 pb-8 z-50 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pt-12 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <button onClick={handleStartTrial} disabled={isStarting} className="w-full bg-teal-500 text-white rounded-[2rem] py-6 text-sm font-bold uppercase tracking-[0.2em] shadow-2xl shadow-teal-100 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
            {isStarting ? <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Start Using StuManage</span><ChevronRight className="h-5 w-5" /></>}
          </button>
        </div>
      </div>
    </main>
  );
}

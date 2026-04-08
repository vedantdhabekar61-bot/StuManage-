'use client';

import { motion } from 'motion/react';
import { Zap, ShieldCheck, CreditCard, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SubscriptionModal() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = () => {
    setLoading(true);
    router.push('/billing');
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-[#FDFBF7]/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-sm rounded-[2.5rem] bg-white p-8 shadow-2xl border border-teal-500/10"
      >
        <div className="flex flex-col items-center text-center gap-6">
          <div className="relative flex items-center justify-center">
            <div className="absolute h-24 w-24 rounded-full bg-amber-500/10 animate-pulse" />
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/20">
              <Zap className="h-8 w-8 fill-current" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black text-[#1C1917] tracking-tight">Trial Expired</h2>
            <p className="text-sm font-medium text-[#78716C] leading-relaxed">
              Your 30-day trial has ended. Upgrade to the Pro plan to continue managing your students and library.
            </p>
          </div>

          <div className="w-full space-y-3 py-2">
            {[
              'Unlimited Student Records',
              'Bulk WhatsApp Reminders',
              'Advanced Analytics',
              'Priority Support'
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-left">
                <div className="h-5 w-5 rounded-full bg-teal-50 flex items-center justify-center">
                  <ShieldCheck className="h-3 w-3 text-teal-600" />
                </div>
                <span className="text-xs font-bold text-[#44403C]">{feature}</span>
              </div>
            ))}
          </div>

          <div className="w-full flex flex-col gap-4">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-black text-[#1C1917]">₹50</span>
              <span className="text-sm font-bold text-[#78716C] uppercase tracking-widest">/ month</span>
            </div>

            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-teal-500 py-4 shadow-lg shadow-teal-200 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <>
                  <span className="text-sm font-extrabold uppercase tracking-[0.15em] text-white">Upgrade Now</span>
                  <ArrowRight className="ml-3 h-4 w-4 text-white transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-[#A8A29E] uppercase tracking-widest">
              <div className="flex items-center gap-1.5">
                <CreditCard className="h-3 w-3" />
                Secure Payment
              </div>
              <div className="h-1 w-1 rounded-full bg-[#D6D3D1]" />
              <span>Razorpay</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

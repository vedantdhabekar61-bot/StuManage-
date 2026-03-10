'use client';

import { useAuth } from '@/hooks/use-auth';
import { motion } from 'motion/react';
import { CreditCard, ShieldCheck, Clock, IndianRupee } from 'lucide-react';
import { useState, useMemo } from 'react';

export function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const { user, updateSubscription } = useAuth();
  const [isPaying, setIsPaying] = useState(false);

  const subscriptionStatus = useMemo(() => {
    if (!user) return { isExpired: false, daysLeft: 30 };

    const createdAt = new Date(user.createdAt);
    const now = new Date();
    const diffTime = now.getTime() - createdAt.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // For testing purposes, you can change 30 to a smaller number like 0 or 1
    const isExpired = diffDays >= 30 && !user.isSubscribed;
    const daysLeft = Math.max(0, 30 - diffDays);

    return { isExpired, daysLeft };
  }, [user]);

  const handlePayment = async () => {
    setIsPaying(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    updateSubscription(true);
    setIsPaying(false);
  };

  if (subscriptionStatus.isExpired) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8 rounded-3xl bg-white p-8 shadow-xl"
        >
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <Clock className="h-10 w-10" />
            </div>
            <h1 className="mt-6 font-serif text-3xl font-bold text-slate-900">Trial Expired</h1>
            <p className="mt-2 text-slate-500">Your 30-day free trial has ended. Please subscribe to continue managing your students.</p>
          </div>

          <div className="space-y-4 rounded-2xl bg-slate-50 p-6">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Plan</span>
              <span className="font-bold text-slate-900">Premium Access</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Price</span>
              <div className="flex items-center gap-1 text-indigo-600 font-bold">
                <IndianRupee className="h-4 w-4" />
                <span className="text-2xl">50</span>
                <span className="text-sm font-normal text-slate-400">/ one-time</span>
              </div>
            </div>
            <div className="h-px bg-slate-200" />
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-slate-600">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Unlimited Student Management
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-600">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                WhatsApp Reminders
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-600">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Seat Occupancy Tracking
              </li>
            </ul>
          </div>

          <button
            onClick={handlePayment}
            disabled={isPaying}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50"
          >
            {isPaying ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                <span>Pay ₹50 Now</span>
              </>
            )}
          </button>
          
          <p className="text-center text-xs text-slate-400">
            Secure payment powered by MyStudents Pay
          </p>
          
          <div className="flex flex-col gap-2 pt-4">
            <button 
              onClick={() => updateSubscription(false)} // Reset to trial (for demo/testing if needed)
              className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
            >
              Need help? Contact Support
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('libmanager_user');
                window.location.href = '/signup';
              }}
              className="text-xs font-medium text-indigo-600 hover:underline"
            >
              Sign up with a different account
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  return <>{children}</>;
}

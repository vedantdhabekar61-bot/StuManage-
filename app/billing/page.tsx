'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useSubscription } from '@/hooks/use-subscription';
import { Check, CreditCard, ShieldCheck, Zap, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { useSnackbar } from '@/components/snackbar';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function BillingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { isActive, daysLeft } = useSubscription();
  const [loading, setLoading] = useState(false);
  const { show } = useSnackbar();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 50 }),
      });

      const order = await response.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'StuManage app Pro',
        description: 'Monthly Subscription',
        order_id: order.id,
        handler: async function (response: any) {
          // Verification call: user_id removed to prevent spoofing
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const result = await verifyRes.json();
          if (result.status === 'success') {
            show('Payment Successful! Your Pro features are now active.', 'success');
            setTimeout(() => {
              router.push('/');
            }, 2000);
          } else {
            show('Payment Verification Failed. Please contact support.', 'error');
          }
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: '#0ea495',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      show('Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24">
      <header className="mb-8 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition-all active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-slate-900">Subscription</h1>
      </header>

      <div className="mx-auto max-w-lg flex flex-col gap-6">
        {/* Status Card */}
        <div className="soft-card p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Current Status</span>
            <div className={cn(
              "status-pill",
              isActive ? "bg-teal-100 text-teal-700" : "bg-rose-100 text-rose-700"
            )}>
              {isActive ? 'Active' : 'Expired'}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-slate-900">{daysLeft}</span>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">days remaining</span>
          </div>
        </div>

        {/* Pricing Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Zap className="h-32 w-32" />
          </div>
          
          <div className="relative z-10">
            <div className="mb-8">
              <div className="inline-flex rounded-full bg-teal-500/20 px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-4">
                Recommended
              </div>
              <h2 className="text-3xl font-bold">Pro Plan</h2>
              <p className="text-slate-400 text-sm mt-1">Unlimited students & full features</p>
            </div>

            <div className="mb-8 flex items-baseline gap-1">
              <span className="text-5xl font-bold">₹50</span>
              <span className="text-slate-400 font-medium">/month</span>
            </div>

            <ul className="mb-10 space-y-5">
              {[
                'Unlimited Student Records',
                'Bulk WhatsApp Reminders',
                'Advanced Analytics',
                'Priority Support',
                'Cloud Sync & Backup'
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-4 text-sm text-slate-300">
                  <div className="rounded-full bg-teal-500/20 p-1">
                    <Check className="h-4 w-4 text-teal-400" />
                  </div>
                  <span className="font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full rounded-2xl bg-teal-500 py-5 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-teal-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                'Activate Pro Now'
              )}
            </button>

            <div className="mt-8 flex items-center justify-center gap-6 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Secure
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Razorpay
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useSubscription } from '@/hooks/use-subscription';
import { Check, CreditCard, ShieldCheck, Zap, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function BillingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, isActive, daysLeft } = useSubscription();
  const [loading, setLoading] = useState(false);

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
        name: 'DeskTracker Pro',
        description: 'Monthly Subscription',
        order_id: order.id,
        handler: async function (response: any) {
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              user_id: user.id,
            }),
          });

          const result = await verifyRes.json();
          if (result.status === 'success') {
            alert('Payment Successful! Your Pro features are now active.');
            router.push('/');
          } else {
            alert('Payment Verification Failed. Please contact support.');
          }
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: '#4f46e5',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="mb-8 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="rounded-full bg-white p-2 text-slate-400 shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-slate-900">Subscription & Billing</h1>
      </header>

      <div className="mx-auto max-w-lg">
        {/* Status Card */}
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-500">Current Status</span>
            <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
              isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
              {isActive ? 'Active' : 'Expired'}
            </span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-slate-900">{daysLeft}</span>
            <span className="text-sm font-medium text-slate-500 mb-1">days remaining</span>
          </div>
        </div>

        {/* Pricing Card */}
        <div className="rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Zap className="h-32 w-32" />
          </div>
          
          <div className="relative z-10">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Pro Plan</h2>
              <p className="text-slate-400 text-sm">Unlimited students & full features</p>
            </div>

            <div className="mb-8 flex items-baseline gap-1">
              <span className="text-4xl font-bold">₹50</span>
              <span className="text-slate-400">/month</span>
            </div>

            <ul className="mb-8 space-y-4">
              {[
                'Unlimited Student Records',
                'Bulk WhatsApp Reminders',
                'Advanced Analytics',
                'Priority Support',
                'Cloud Sync & Backup'
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="rounded-full bg-emerald-500/20 p-1">
                    <Check className="h-3 w-3 text-emerald-400" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full rounded-2xl bg-indigo-600 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                'Activate Pro Now'
              )}
            </button>

            <div className="mt-6 flex items-center justify-center gap-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              <div className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                Secure Payment
              </div>
              <div className="flex items-center gap-1">
                <CreditCard className="h-3 w-3" />
                Razorpay
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

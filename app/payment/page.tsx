'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Check, 
  CreditCard, 
  Smartphone, 
  Lock,
  Zap,
  CheckCircle2
} from 'lucide-react';
import Image from 'next/image';

export default function PaymentPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = (method: string) => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      router.push('/');
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col pb-32">
      {/* Header */}
      <header className="flex items-center gap-4 p-6 bg-white border-b border-slate-100 sticky top-0 z-30">
        <button 
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100 active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-slate-900">Upgrade to Pro</h1>
      </header>

      <div className="flex-1 p-6 flex flex-col gap-8 max-w-md mx-auto w-full">
        {/* Plan Card */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Selected Plan</h2>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-indigo-600 p-8 text-white shadow-xl shadow-indigo-100">
            {/* Decorative Background Elements */}
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-indigo-500/50 blur-2xl" />
            
            <div className="relative flex flex-col gap-6">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <h3 className="text-2xl font-black">Pro Plan</h3>
                  <p className="text-indigo-100 text-sm font-medium">Unlimited Students + WhatsApp</p>
                </div>
                <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl">
                  <ShieldCheck className="h-6 w-6" />
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black">₹50</span>
                <span className="text-indigo-100 font-bold">/ Month</span>
              </div>

              <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-100">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Instant Activation after payment</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Methods */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Payment Methods</h2>
            <p className="text-[10px] text-slate-400 px-1">Secure UPI Payment • सुरक्षित भुगतान</p>
          </div>

          <div className="flex flex-col gap-4">
            {/* Google Pay Button */}
            <button 
              onClick={() => handlePayment('gpay')}
              disabled={isProcessing}
              className="group relative flex items-center justify-center gap-3 w-full rounded-2xl bg-white border-2 border-slate-100 py-5 shadow-sm transition-all hover:border-indigo-200 active:scale-95 disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <div className="relative h-6 w-16">
                  {/* Mock GPay Logo */}
                  <div className="flex items-center gap-1">
                    <div className="h-4 w-4 rounded-full bg-blue-500" />
                    <div className="h-4 w-4 rounded-full bg-red-500" />
                    <div className="h-4 w-4 rounded-full bg-yellow-500" />
                    <div className="h-4 w-4 rounded-full bg-green-500" />
                    <span className="font-bold text-slate-700 text-sm">Pay</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-700">with Google Pay</span>
              </div>
              <ChevronRight className="absolute right-6 h-4 w-4 text-slate-300 group-hover:text-indigo-400" />
            </button>

            {/* PhonePe Button */}
            <button 
              onClick={() => handlePayment('phonepe')}
              disabled={isProcessing}
              className="group relative flex items-center justify-center gap-3 w-full rounded-2xl bg-[#5f259f] py-5 shadow-lg shadow-purple-100 transition-all active:scale-95 disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 bg-white rounded-lg flex items-center justify-center">
                  <Smartphone className="h-4 w-4 text-[#5f259f]" />
                </div>
                <span className="text-sm font-bold text-white">Pay with PhonePe</span>
              </div>
              <ChevronRight className="absolute right-6 h-4 w-4 text-white/40 group-hover:text-white" />
            </button>
          </div>
        </section>

        {/* Trust Elements */}
        <section className="flex flex-col gap-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col gap-2 items-center text-center">
              <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-600 leading-tight">1000+ Teachers already using</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col gap-2 items-center text-center">
              <div className="h-8 w-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Lock className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-600 leading-tight">Secure UPI Payment</span>
            </div>
          </div>
        </section>
      </div>

      {/* Sticky Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pt-10">
        <div className="max-w-md mx-auto">
          <button 
            onClick={() => handlePayment('default')}
            disabled={isProcessing}
            className="w-full bg-indigo-600 text-white rounded-2xl py-5 text-sm font-bold uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Activate Pro Plan"
            )}
          </button>
        </div>
      </div>
    </main>
  );
}

function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function Users(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

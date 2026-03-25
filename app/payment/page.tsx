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
      <header className="flex items-center gap-4 p-6 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30">
        <button 
          onClick={() => router.back()}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-500 transition-all hover:bg-slate-100 active:scale-95"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Upgrade to Pro</h1>
      </header>

      <div className="flex-1 p-6 flex flex-col gap-10 max-w-md mx-auto w-full">
        {/* Plan Card */}
        <section className="flex flex-col gap-4">
          <h2 className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em] px-1">Selected Plan</h2>
          <div className="relative overflow-hidden rounded-[3rem] bg-teal-500 p-10 text-white shadow-2xl shadow-teal-100">
            {/* Decorative Background Elements */}
            <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -left-12 -bottom-12 h-48 w-48 rounded-full bg-teal-400/50 blur-3xl" />
            
            <div className="relative flex flex-col gap-8">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2">
                  <h3 className="text-3xl font-bold tracking-tight">Pro Plan</h3>
                  <p className="text-teal-50 text-sm font-medium opacity-80">Unlimited Students + WhatsApp</p>
                </div>
                <div className="bg-white/20 backdrop-blur-md p-3 rounded-[1.25rem] border border-white/30">
                  <ShieldCheck className="h-8 w-8" />
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold tracking-tight">₹50</span>
                <span className="text-teal-50 font-bold opacity-80">/ Month</span>
              </div>

              <div className="flex flex-col gap-3 pt-6 border-t border-white/10">
                <div className="flex items-center gap-3 text-xs font-bold text-teal-50">
                  <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center">
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                  <span>Instant Activation after payment</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Methods */}
        <section className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em] px-1">Payment Methods</h2>
            <p className="text-xs font-medium text-slate-400 px-1">Secure UPI Payment • सुरक्षित भुगतान</p>
          </div>

          <div className="flex flex-col gap-4">
            {/* Google Pay Button */}
            <button 
              onClick={() => handlePayment('gpay')}
              disabled={isProcessing}
              className="group relative flex items-center justify-center gap-4 w-full rounded-[2rem] bg-white border border-white py-6 shadow-xl shadow-slate-200/50 transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="relative h-6 w-16">
                  {/* Mock GPay Logo */}
                  <div className="flex items-center gap-1.5">
                    <div className="h-5 w-5 rounded-full bg-blue-500" />
                    <div className="h-5 w-5 rounded-full bg-red-500" />
                    <div className="h-5 w-5 rounded-full bg-yellow-500" />
                    <div className="h-5 w-5 rounded-full bg-green-500" />
                    <span className="font-bold text-slate-700 text-lg">Pay</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-700">with Google Pay</span>
              </div>
              <ChevronRight className="absolute right-8 h-5 w-5 text-slate-300 group-hover:text-teal-500 transition-colors" />
            </button>

            {/* PhonePe Button */}
            <button 
              onClick={() => handlePayment('phonepe')}
              disabled={isProcessing}
              className="group relative flex items-center justify-center gap-4 w-full rounded-[2rem] bg-[#5f259f] py-6 shadow-xl shadow-purple-100 transition-all active:scale-95 disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-white/20 rounded-xl flex items-center justify-center border border-white/20">
                  <Smartphone className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-bold text-white">Pay with PhonePe</span>
              </div>
              <ChevronRight className="absolute right-8 h-5 w-5 text-white/40 group-hover:text-white transition-colors" />
            </button>
          </div>
        </section>

        {/* Trust Elements */}
        <section className="flex flex-col gap-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-[2rem] border border-white flex flex-col gap-3 items-center text-center shadow-sm">
              <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100">
                <Users className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 leading-tight uppercase tracking-widest">1000+ Teachers using</span>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-white flex flex-col gap-3 items-center text-center shadow-sm">
              <div className="h-10 w-10 rounded-2xl bg-teal-50 text-teal-500 flex items-center justify-center border border-teal-100">
                <Lock className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 leading-tight uppercase tracking-widest">Secure UPI Payment</span>
            </div>
          </div>
        </section>
      </div>

      {/* Sticky Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pt-12">
        <div className="max-w-md mx-auto">
          <button 
            onClick={() => handlePayment('default')}
            disabled={isProcessing}
            className="w-full bg-teal-500 text-white rounded-[2rem] py-6 text-sm font-bold uppercase tracking-[0.2em] shadow-2xl shadow-teal-100 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isProcessing ? (
              <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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

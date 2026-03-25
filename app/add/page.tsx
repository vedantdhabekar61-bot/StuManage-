'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Phone, Armchair, Clock, CreditCard, Calendar, CheckCircle2, IndianRupee, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { Shift, PaymentMethod, PaymentStatus } from '@/lib/types';
import { motion, AnimatePresence } from 'motion/react';
import { useStudents } from '@/hooks/use-students';

export default function AddStudentPage() {
  const router = useRouter();
  const { addStudent } = useStudents();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | string>(1);
  const [durationUnit, setDurationUnit] = useState<'Month' | 'Year'>('Month');

  const [formData, setFormData] = useState(() => {
    const now = new Date();
    const expiry = new Date(now);
    expiry.setMonth(expiry.getMonth() + 1);
    
    return {
      name: '',
      phone: '',
      deskNumber: '',
      shift: 'Morning' as Shift,
      plan: 'Custom Plan',
      price: 0,
      startDate: now.toISOString().split('T')[0],
      expiryDate: expiry.toISOString().split('T')[0],
      paymentStatus: 'Paid' as PaymentStatus,
      paymentMethod: 'UPI' as PaymentMethod,
    };
  });

  const calculateExpiry = (startDate: string, dur: number, unit: 'Month' | 'Year') => {
    if (!startDate) return '';
    const start = new Date(startDate);
    if (isNaN(start.getTime())) return '';
    
    const expiry = new Date(start);
    if (unit === 'Month') {
      expiry.setMonth(expiry.getMonth() + dur);
    } else {
      expiry.setFullYear(expiry.getFullYear() + dur);
    }
    return expiry.toISOString().split('T')[0];
  };

  const handleStartDateChange = (date: string) => {
    setError(null);
    const durNum = typeof duration === 'string' ? parseInt(duration) || 0 : duration;
    const newExpiry = calculateExpiry(date, durNum, durationUnit);
    setFormData(prev => ({ 
      ...prev, 
      startDate: date,
      expiryDate: newExpiry 
    }));
  };

  const handleDurationChange = (val: string) => {
    const numVal = parseInt(val);
    const durNum = isNaN(numVal) ? 0 : numVal;
    const newExpiry = calculateExpiry(formData.startDate, durNum, durationUnit);
    setDuration(val === '' ? '' : numVal);
    setFormData(prev => ({ ...prev, expiryDate: newExpiry }));
  };

  const handleUnitChange = (unit: 'Month' | 'Year') => {
    const durNum = typeof duration === 'string' ? parseInt(duration) || 0 : duration;
    const newExpiry = calculateExpiry(formData.startDate, durNum, unit);
    setDurationUnit(unit);
    setFormData(prev => ({ ...prev, expiryDate: newExpiry }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      await addStudent({
        ...formData,
        deskNumber: parseInt(formData.deskNumber),
      });
      
      // Simulate API call delay for UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setIsSubmitting(false);
      setShowSuccess(true);
      
      setTimeout(() => {
        router.push('/students');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to register student. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-slate-50 p-6 pb-24">
      <header className="flex flex-col gap-6 pt-4 pb-8">
        <button 
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition-all active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Add Student</h1>
          <p className="text-sm font-medium text-slate-400">Register a new member to your library.</p>
        </div>
      </header>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-600 border border-rose-100"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {/* Basic Info */}
        <section className="flex flex-col gap-4">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-600/60">Student Details</h2>
          <div className="flex flex-col gap-3">
            <div className="relative">
              <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input 
                required
                type="text" 
                placeholder="Full Name" 
                className="w-full rounded-2xl border-none bg-white py-4 pl-12 pr-4 text-sm font-medium shadow-sm focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                value={formData.name}
                onFocus={() => setError(null)}
                onChange={(e) => {
                  setError(null);
                  setFormData(prev => ({ ...prev, name: e.target.value }));
                }}
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input 
                required
                type="tel" 
                placeholder="Phone Number" 
                className="w-full rounded-2xl border-none bg-white py-4 pl-12 pr-4 text-sm font-medium shadow-sm focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                value={formData.phone}
                onFocus={() => setError(null)}
                onChange={(e) => {
                  setError(null);
                  setFormData(prev => ({ ...prev, phone: e.target.value }));
                }}
              />
            </div>
          </div>
        </section>

        {/* Desk & Shift */}
        <section className="flex flex-col gap-4">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-600/60">Desk & Shift</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <Armchair className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input 
                required
                type="number" 
                placeholder="Desk No." 
                className="w-full rounded-2xl border-none bg-white py-4 pl-12 pr-4 text-sm font-medium shadow-sm focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                value={formData.deskNumber}
                onFocus={() => setError(null)}
                onChange={(e) => {
                  setError(null);
                  setFormData(prev => ({ ...prev, deskNumber: e.target.value }));
                }}
              />
            </div>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <select 
                className="w-full appearance-none rounded-2xl border-none bg-white py-4 pl-12 pr-4 text-sm font-medium shadow-sm focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                value={formData.shift}
                onFocus={() => setError(null)}
                onChange={(e) => {
                  setError(null);
                  setFormData(prev => ({ ...prev, shift: e.target.value as Shift }));
                }}
              >
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
                <option value="Full Day">Full Day</option>
              </select>
            </div>
          </div>
        </section>

        {/* Plan & Payment */}
        <section className="flex flex-col gap-4">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-600/60">Plan & Billing</h2>
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Amount (₹)</span>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input 
                    required
                    type="number" 
                    placeholder="0.00" 
                    className="w-full rounded-2xl border-none bg-white py-4 pl-10 pr-4 text-sm font-bold shadow-sm focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                    value={formData.price === 0 && formData.price !== undefined ? '' : formData.price}
                    onFocus={() => setError(null)}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({ ...prev, price: val === '' ? 0 : parseInt(val) || 0 }));
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Duration</span>
                <div className="flex items-center gap-2">
                  <input 
                    required
                    type="number" 
                    min="1"
                    className="w-16 rounded-2xl border-none bg-white py-4 px-3 text-sm font-bold shadow-sm focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                    value={duration}
                    onChange={(e) => handleDurationChange(e.target.value)}
                  />
                  <select 
                    className="flex-1 rounded-2xl border-none bg-white py-4 px-3 text-sm font-bold shadow-sm focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                    value={durationUnit}
                    onChange={(e) => handleUnitChange(e.target.value as 'Month' | 'Year')}
                  >
                    <option value="Month">Month(s)</option>
                    <option value="Year">Year(s)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Start Date</span>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="date" 
                    className="w-full rounded-2xl border-none bg-white py-4 pl-12 pr-4 text-sm font-bold shadow-sm focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                    value={formData.startDate}
                    onFocus={() => setError(null)}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Expiry Date</span>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input 
                    disabled
                    type="date" 
                    className="w-full rounded-2xl border-none bg-slate-100 py-4 pl-12 pr-4 text-sm font-bold text-slate-400 shadow-inner"
                    value={formData.expiryDate}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Payment Method</span>
              <div className="grid grid-cols-2 gap-3">
                {['UPI', 'Cash'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => {
                      setError(null);
                      setFormData(prev => ({ ...prev, paymentMethod: method as PaymentMethod }));
                    }}
                    className={cn(
                      "rounded-2xl py-4 text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow-sm",
                      formData.paymentMethod === method 
                        ? "bg-teal-500 text-white shadow-lg shadow-teal-100" 
                        : "bg-white text-slate-500"
                    )}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <button 
          disabled={isSubmitting}
          type="submit" 
          className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl bg-teal-500 py-5 text-sm font-bold uppercase tracking-widest text-white shadow-xl shadow-teal-100 transition-all active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="h-6 w-6" />
              <span>Register Student</span>
            </>
          )}
        </button>
      </form>

      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="soft-card p-10 flex flex-col items-center gap-6 text-center max-w-xs w-full"
            >
              <div className="h-20 w-20 rounded-full bg-teal-50 flex items-center justify-center text-teal-500 shadow-inner">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-bold text-slate-900">Success!</h3>
                <p className="text-sm font-medium text-slate-400">Student has been registered successfully.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

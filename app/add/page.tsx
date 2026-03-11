'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Phone, Armchair, Clock, CreditCard, Calendar, CheckCircle2, IndianRupee, AlertCircle, ArrowLeft } from 'lucide-react';
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
      enableAutoReminder: true,
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
    <main className="flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-4">
        <button 
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Add New Student</h1>
          <p className="text-sm text-slate-500">Register a new student and assign a desk.</p>
        </div>
      </header>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl bg-rose-50 p-4 text-sm font-medium text-rose-600 border border-rose-100"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Basic Info */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Student Details</h2>
          <div className="flex flex-col gap-3">
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input 
                required
                type="text" 
                placeholder="Full Name" 
                className="w-full rounded-2xl border border-slate-100 bg-white py-3 pl-10 pr-4 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
                value={formData.name}
                onFocus={() => setError(null)}
                onChange={(e) => {
                  setError(null);
                  setFormData(prev => ({ ...prev, name: e.target.value }));
                }}
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input 
                required
                type="tel" 
                placeholder="Phone Number" 
                className="w-full rounded-2xl border border-slate-100 bg-white py-3 pl-10 pr-4 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
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
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Desk & Shift</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <Armchair className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input 
                required
                type="number" 
                placeholder="Desk No." 
                className="w-full rounded-2xl border border-slate-100 bg-white py-3 pl-10 pr-4 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
                value={formData.deskNumber}
                onFocus={() => setError(null)}
                onChange={(e) => {
                  setError(null);
                  setFormData(prev => ({ ...prev, deskNumber: e.target.value }));
                }}
              />
            </div>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select 
                className="w-full appearance-none rounded-2xl border border-slate-100 bg-white py-3 pl-10 pr-4 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
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
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Plan & Billing</h2>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-slate-500">Amount (₹)</span>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input 
                    required
                    type="number" 
                    placeholder="0.00" 
                    className="w-full rounded-2xl border border-slate-100 bg-white py-3 pl-10 pr-4 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
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
                <span className="text-xs font-medium text-slate-500">Duration</span>
                <div className="flex items-center gap-1">
                  <input 
                    required
                    type="number" 
                    min="1"
                    className="w-16 rounded-2xl border border-slate-100 bg-white py-3 px-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
                    value={duration}
                    onChange={(e) => handleDurationChange(e.target.value)}
                  />
                  <select 
                    className="flex-1 rounded-2xl border border-slate-100 bg-white py-3 px-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
                    value={durationUnit}
                    onChange={(e) => handleUnitChange(e.target.value as 'Month' | 'Year')}
                  >
                    <option value="Month">Month(s)</option>
                    <option value="Year">Year(s)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-slate-500">Start Date</span>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="date" 
                    className="w-full rounded-2xl border border-slate-100 bg-white py-3 pl-10 pr-4 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
                    value={formData.startDate}
                    onFocus={() => setError(null)}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-slate-500">Fees Due Date</span>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input 
                    disabled
                    type="date" 
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-3 pl-10 pr-4 text-sm shadow-sm"
                    value={formData.expiryDate}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-slate-500">Payment Method</span>
              <div className="grid grid-cols-2 gap-2">
                {['UPI', 'Cash'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => {
                      setError(null);
                      setFormData(prev => ({ ...prev, paymentMethod: method as PaymentMethod }));
                    }}
                    className={`rounded-2xl border py-2 text-[10px] font-bold uppercase tracking-wider transition-all ${
                      formData.paymentMethod === method 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                        : 'border-slate-100 bg-white text-slate-500'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-white p-4 border border-slate-100 shadow-sm">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-slate-900">Auto WhatsApp Reminder</span>
                <span className="text-[10px] font-medium text-slate-400">Send automatic fee alerts</span>
              </div>
              <button 
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, enableAutoReminder: !prev.enableAutoReminder }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  formData.enableAutoReminder ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.enableAutoReminder ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        <button 
          disabled={isSubmitting}
          type="submit" 
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5" />
              <span>Register Student</span>
            </>
          )}
        </button>
      </form>

      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm p-6"
          >
            <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-8 text-center shadow-2xl">
              <div className="rounded-full bg-emerald-100 p-4 text-emerald-600">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-bold text-slate-900">Registration Successful!</h3>
                <p className="text-sm text-slate-500">Redirecting to student list...</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

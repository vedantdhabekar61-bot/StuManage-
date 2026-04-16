'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Armchair, CreditCard, CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { Shift, PaymentMethod, PaymentStatus } from '@/lib/types';
import { motion, AnimatePresence } from 'motion/react';
import { useStudents } from '@/hooks/use-students';
import { cn } from '@/lib/utils';

export default function AddStudentPage() {
  const router = useRouter();
  const { addStudent, students } = useStudents();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | string>(3);

  const [formData, setFormData] = useState(() => {
    const now = new Date();
    const expiry = new Date(now);
    expiry.setMonth(expiry.getMonth() + 3);
    
    return {
      studentName: '',
      phoneNumber: '',
      deskNumber: '',
      shift: 'Afternoon' as Shift,
      plan: 'Custom Plan',
      price: 1200,
      joinDate: now.toISOString().split('T')[0],
      expiryDate: expiry.toISOString().split('T')[0],
      paymentStatus: 'Paid' as PaymentStatus,
      paymentMethod: 'UPI' as PaymentMethod,
    };
  });

  const calculateExpiry = (startDate: string, dur: number) => {
    if (!startDate) return '';
    const start = new Date(startDate);
    if (isNaN(start.getTime())) return '';
    
    const expiry = new Date(start);
    expiry.setMonth(expiry.getMonth() + dur);
    return expiry.toISOString().split('T')[0];
  };

  const handleStartDateChange = (date: string) => {
    setError(null);
    const durNum = typeof duration === 'string' ? parseInt(duration) || 0 : duration;
    const newExpiry = calculateExpiry(date, durNum);
    setFormData(prev => ({ 
      ...prev, 
      joinDate: date,
      expiryDate: newExpiry 
    }));
  };

  const handleDurationChange = (val: string) => {
    const numVal = parseInt(val);
    const durNum = isNaN(numVal) ? 0 : numVal;
    const newExpiry = calculateExpiry(formData.joinDate, durNum);
    setDuration(val === '' ? '' : numVal);
    setFormData(prev => ({ ...prev, expiryDate: newExpiry }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      await addStudent({
        ...formData,
        deskNumber: parseInt(formData.deskNumber) || 0,
      });
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => {
        router.push('/students');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to register student. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-[#FAFAFA] pb-24 font-sans">
      {/* Header */}
      <header className="flex items-center gap-6 px-6 pt-8 pb-4 bg-white sticky top-0 z-10">
        <button 
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#1C1917] transition-all active:scale-95"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-[20px] font-bold text-[#1C1917]">Add New Student</h1>
      </header>

      <div className="px-6 py-8 flex flex-col items-center">
        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full mb-6 rounded-2xl bg-rose-50 p-4 text-[14px] font-bold text-rose-600 border border-rose-100 flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="w-full space-y-10">
          {/* Student Identity */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-[#0ea495]">
              <User className="h-5 w-5" />
              <h2 className="text-[13px] font-bold uppercase tracking-widest">Student Identity</h2>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-[#1C1917] ml-1">Full Name</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Rahul Sharma" 
                  className="w-full bg-white border border-gray-200 rounded-3xl py-4 px-6 text-[15px] font-medium placeholder:text-[#78716C]/40 focus:ring-2 focus:ring-[#0ea495]/20 focus:border-[#0ea495] focus:outline-none transition-all"
                  value={formData.studentName}
                  onChange={(e) => setFormData(prev => ({ ...prev, studentName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-[#1C1917] ml-1">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[15px] font-bold text-[#78716C]">+91</span>
                  <input 
                    required
                    type="tel" 
                    placeholder="98765 43210" 
                    className="w-full bg-white border border-gray-200 rounded-3xl py-4 pl-16 pr-6 text-[15px] font-medium placeholder:text-[#78716C]/40 focus:ring-2 focus:ring-[#0ea495]/20 focus:border-[#0ea495] focus:outline-none transition-all"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Allocation */}
          <section className="bg-white rounded-[32px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-6">
            <div className="flex items-center gap-2 text-[#0ea495]">
              <Armchair className="h-5 w-5" />
              <h2 className="text-[13px] font-bold uppercase tracking-widest">Allocation</h2>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-[#1C1917] ml-1">Desk No.</label>
                <input 
                  required
                  type="number" 
                  placeholder="Enter assigned desk number" 
                  className="w-full bg-[#F5F7F9] border-none rounded-2xl py-4 px-6 text-[15px] font-medium placeholder:text-[#78716C]/50 focus:ring-2 focus:ring-[#0ea495]/20 focus:outline-none transition-all"
                  value={formData.deskNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, deskNumber: e.target.value }))}
                />
                {formData.deskNumber && (
                  <div className="flex items-center gap-2 mt-2">
                    {(() => {
                      const deskNum = parseInt(formData.deskNumber);
                      const occupiedBy = students.find(s => 
                        Number(s.deskNumber) === deskNum && 
                        (s.shift === formData.shift || s.shift === 'Full Day' || formData.shift === 'Full Day')
                      );
                      if (occupiedBy) {
                        return (
                          <>
                            <AlertCircle className="h-3 w-3 text-rose-500" />
                            <span className="text-[11px] font-medium text-rose-500">
                              Desk {deskNum} is occupied by {occupiedBy.studentName} ({occupiedBy.shift})
                            </span>
                          </>
                        );
                      }
                      return (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-[#0ea495]" />
                          <span className="text-[11px] font-medium text-[#0ea495]">Desk {deskNum} is available for this shift</span>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <label className="text-[13px] font-bold text-[#1C1917] ml-1">Preferred Shift</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['Morning', 'Afternoon', 'Evening', 'Full Day'] as Shift[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, shift: s }))}
                      className={cn(
                        "py-3.5 rounded-2xl text-[14px] font-bold transition-all active:scale-95 border",
                        formData.shift === s 
                          ? "bg-[#0ea495] text-white border-[#0ea495] shadow-lg shadow-[#0ea495]/20" 
                          : "bg-white text-[#1C1917] border-gray-100"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Plan & Billing */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-[#0ea495]">
              <CreditCard className="h-5 w-5" />
              <h2 className="text-[13px] font-bold uppercase tracking-widest">Plan & Billing</h2>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-[#1C1917] ml-1">Amount (₹)</label>
                  <input 
                    required
                    type="number" 
                    className="w-full bg-white border border-gray-200 rounded-3xl py-4 px-6 text-[18px] font-bold text-[#1C1917] focus:ring-2 focus:ring-[#0ea495]/20 focus:border-[#0ea495] focus:outline-none transition-all"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-[#1C1917] ml-1">Duration</label>
                  <div className="relative">
                    <select 
                      className="w-full bg-white border border-gray-200 rounded-3xl py-4 px-6 text-[15px] font-bold text-[#1C1917] appearance-none focus:ring-2 focus:ring-[#0ea495]/20 focus:border-[#0ea495] focus:outline-none transition-all"
                      value={duration}
                      onChange={(e) => handleDurationChange(e.target.value)}
                    >
                      <option value={1}>1 Month</option>
                      <option value={3}>3 Months</option>
                      <option value={6}>6 Months</option>
                      <option value={12}>1 Year</option>
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="h-5 w-5 text-[#78716C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-[#1C1917] ml-1">Start Date</label>
                  <div className="relative">
                    <input 
                      type="date" 
                      className="w-full bg-white border border-gray-200 rounded-3xl py-4 px-6 text-[14px] font-bold text-[#1C1917] focus:ring-2 focus:ring-[#0ea495]/20 focus:border-[#0ea495] focus:outline-none transition-all"
                      value={formData.joinDate}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-[#1C1917] ml-1">Fees Due Date</label>
                  <div className="relative">
                    <input 
                      type="date" 
                      className="w-full bg-white border border-gray-200 rounded-3xl py-4 px-6 text-[14px] font-bold text-[#1C1917] focus:ring-2 focus:ring-[#0ea495]/20 focus:border-[#0ea495] focus:outline-none transition-all"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[13px] font-bold text-[#1C1917] ml-1">Payment Method</label>
                <div className="flex bg-[#F5F7F9] p-1.5 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'UPI' }))}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-bold transition-all",
                      formData.paymentMethod === 'UPI' ? "bg-white text-[#0ea495] shadow-sm" : "text-[#78716C]"
                    )}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
                    </svg>
                    UPI
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'Cash' }))}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-bold transition-all",
                      formData.paymentMethod === 'Cash' ? "bg-white text-[#0ea495] shadow-sm" : "text-[#78716C]"
                    )}
                  >
                    <CreditCard className="h-4 w-4" />
                    Cash
                  </button>
                </div>
              </div>
            </div>
          </section>

          <button 
            disabled={isSubmitting}
            type="submit" 
            className="flex w-full items-center justify-center gap-3 rounded-3xl bg-[#0ea495] py-5 text-[16px] font-bold text-white shadow-xl shadow-[#0ea495]/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <User className="h-5 w-5" />
                <span>Register Student</span>
              </>
            )}
          </button>
        </form>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1C1917]/40 backdrop-blur-md p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[40px] p-10 flex flex-col items-center gap-6 text-center max-w-xs w-full shadow-2xl"
            >
              <div className="h-20 w-20 rounded-full bg-[#0ea495]/10 flex items-center justify-center text-[#0ea495]">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-[24px] font-extrabold text-[#1C1917]">Success!</h3>
                <p className="text-[15px] font-semibold text-[#78716C]">Student has been registered successfully.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

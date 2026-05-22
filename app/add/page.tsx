'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Armchair, CreditCard, CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { Shift, PaymentMethod, PaymentStatus } from '@/lib/types';
import { motion, AnimatePresence } from 'motion/react';
import { useStudents } from '@/hooks/use-students';
import { cn, isValidPhone } from '@/lib/utils';
import { useSnackbar } from '@/components/snackbar';

// Helper to reliably get YYYY-MM-DD in local time
const toLocalDateString = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().split('T')[0];
};

export default function AddStudentPage() {
  const router = useRouter();
  const { addStudent, students, isLoaded: studentsLoaded } = useStudents();
  const snackbar = useSnackbar();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      joinDate: toLocalDateString(now),
      expiryDate: toLocalDateString(expiry),
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
    return toLocalDateString(expiry);
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
    
    // Validate phone number
    if (!isValidPhone(formData.phoneNumber)) {
      setError('Please enter a valid 10-digit phone number starting with 6-9.');
      snackbar.show('Please enter a valid 10-digit phone number.', 'error');
      setIsSubmitting(false);
      return;
    }
    
    try {
      await addStudent({
        ...formData,
        deskNumber: parseInt(formData.deskNumber) || 0,
      });
      
      snackbar.show('Student successfully registered!', 'success');
      router.push('/students'); // Instant redirect
      
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to register student. Please try again.';
      setError(errorMessage);
      snackbar.show(errorMessage, 'error');
      setIsSubmitting(false);
    }
  };

  if (!studentsLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-bold text-muted uppercase tracking-widest">Loading Roster...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-background pb-24 font-sans">
      {/* Header */}
      <header className="flex items-center gap-6 px-6 pt-8 pb-4 bg-card sticky top-0 z-10 border-b border-border/10">
        <button 
          onClick={() => router.back()}
          className="flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-all active:scale-95"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-[20px] font-bold text-foreground">Add New Student</h1>
      </header>

      <div className="px-6 py-8 flex flex-col items-center">
        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full mb-6 rounded-2xl bg-rose-50 dark:bg-rose-950/20 p-4 text-[14px] font-bold text-rose-600 border border-rose-100 flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="w-full space-y-10">
          {/* Student Identity */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-primary">
              <User className="h-5 w-5" />
              <h2 className="text-[13px] font-bold uppercase tracking-widest">Student Identity</h2>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-foreground ml-1">Full Name</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Rahul Sharma" 
                  className="w-full bg-card border border-border/50 rounded-3xl py-4 px-6 text-[15px] font-medium placeholder:text-muted/40 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all text-foreground"
                  value={formData.studentName}
                  onChange={(e) => setFormData(prev => ({ ...prev, studentName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-foreground ml-1">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[15px] font-bold text-muted">+91</span>
                  <input 
                    required
                    type="tel" 
                    inputMode="numeric"
                    placeholder="98765 43210" 
                    className="w-full bg-card border border-border/50 rounded-3xl py-4 pl-16 pr-6 text-[15px] font-medium placeholder:text-muted/40 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all text-foreground"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  />
                  {formData.phoneNumber && !isValidPhone(formData.phoneNumber) && (
                    <p className="mt-1 ml-1 text-[11px] font-medium text-rose-500">Invalid phone number</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Allocation */}
          <section className="bg-card rounded-[32px] p-6 shadow-soft border border-border/30 space-y-6">
            <div className="flex items-center gap-2 text-primary">
              <Armchair className="h-5 w-5" />
              <h2 className="text-[13px] font-bold uppercase tracking-widest">Allocation</h2>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-foreground ml-1">Desk No.</label>
                <input 
                  required
                  type="number" 
                  inputMode="numeric"
                  placeholder="Enter assigned desk number" 
                  className="w-full bg-background border-none rounded-2xl py-4 px-6 text-[15px] font-medium placeholder:text-muted/50 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all text-foreground"
                  value={formData.deskNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, deskNumber: e.target.value }))}
                />
                {formData.deskNumber && (
                  <div className="flex items-center gap-2 mt-2">
                    {(() => {
                      const deskNum = parseInt(formData.deskNumber);
                      const occupiedBy = students.find(s => 
                        s.deskNumber && Number(s.deskNumber.toString().trim()) === deskNum && 
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
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                          <span className="text-[11px] font-medium text-primary">Desk {deskNum} is available for this shift</span>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <label className="text-[13px] font-bold text-foreground ml-1">Preferred Shift</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['Morning', 'Afternoon', 'Evening', 'Full Day'] as Shift[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, shift: s }))}
                      className={cn(
                        "py-3.5 rounded-2xl text-[14px] font-bold transition-all active:scale-95 border",
                        formData.shift === s 
                          ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                          : "bg-background text-foreground border-border/50"
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
            <div className="flex items-center gap-2 text-primary">
              <CreditCard className="h-5 w-5" />
              <h2 className="text-[13px] font-bold uppercase tracking-widest">Plan & Billing</h2>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-foreground ml-1">Amount (₹)</label>
                  <input 
                    required
                    type="number" 
                    inputMode="numeric"
                    className="w-full bg-card border border-border/50 rounded-3xl py-4 px-6 text-[18px] font-bold text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-foreground ml-1">Duration</label>
                  <div className="relative">
                    <select 
                      className="w-full bg-card border border-border/50 rounded-3xl py-4 px-6 text-[15px] font-bold text-foreground appearance-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                      value={duration}
                      onChange={(e) => handleDurationChange(e.target.value)}
                    >
                      <option value={1}>1 Month</option>
                      <option value={3}>3 Months</option>
                      <option value={6}>6 Months</option>
                      <option value={12}>1 Year</option>
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="h-5 w-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-foreground ml-1">Start Date</label>
                  <div className="relative">
                    <input 
                      type="date" 
                      className="w-full bg-card border border-border/50 rounded-3xl py-4 px-6 text-[14px] font-bold text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                      value={formData.joinDate}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-foreground ml-1">Fees Due Date</label>
                  <div className="relative">
                    <input 
                      type="date" 
                      className="w-full bg-card border border-border/50 rounded-3xl py-4 px-6 text-[14px] font-bold text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[13px] font-bold text-foreground ml-1">Payment Method</label>
                <div className="flex bg-background p-1.5 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'UPI' }))}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-bold transition-all",
                      formData.paymentMethod === 'UPI' ? "bg-card text-primary shadow-sm" : "text-muted"
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
                      formData.paymentMethod === 'Cash' ? "bg-card text-primary shadow-sm" : "text-muted"
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
            className="flex w-full items-center justify-center gap-3 rounded-3xl bg-primary py-5 text-[16px] font-bold text-white shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
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
    </main>
  );
}

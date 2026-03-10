'use client';

import { Users, Armchair, AlertCircle, IndianRupee, Clock, ArrowRight, PlusCircle, MessageCircle, Check, X, ShieldCheck } from 'lucide-react';
import { MetricsCard } from '@/components/metrics-card';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '@/hooks/use-settings';
import { useStudents } from '@/hooks/use-students';
import { Student } from '@/lib/types';
import { useMemo, useState } from 'react';

import { useAuth } from '@/hooks/use-auth';
import { LogOut } from 'lucide-react';

export default function Dashboard() {
  const { settings } = useSettings();
  const { students, isLoaded, updateStudent } = useStudents();
  const { logout, user } = useAuth();
  const [showTrialInfo, setShowTrialInfo] = useState(false);
  
  const trialStatus = useMemo(() => {
    if (!user) return { daysLeft: 30 };
    const createdAt = new Date(user.createdAt);
    const now = new Date();
    const diffTime = now.getTime() - createdAt.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return { daysLeft: Math.max(0, 30 - diffDays) };
  }, [user]);
  const metrics = useMemo(() => {
    const activeStudents = students.length;
    const availableSeats = settings.totalSeats - activeStudents;
    const overdueStudents = students.filter(s => s.paymentStatus === 'Overdue');
    const revenueThisMonth = students.reduce((acc, s) => acc + (s.paymentStatus === 'Paid' ? s.price : 0), 0);
    const occupancyPercentage = settings.totalSeats > 0 ? Math.round((activeStudents / settings.totalSeats) * 100) : 0;
    
    const urgentActions = students.filter(s => {
      const expiry = new Date(s.expiryDate);
      const today = new Date();
      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 3 || s.paymentStatus === 'Overdue';
    });

    const currentMonth = new Date().toLocaleString('default', { month: 'short' });

    return {
      activeStudents,
      availableSeats,
      overdueStudentsCount: overdueStudents.length,
      revenueThisMonth,
      occupancyPercentage,
      urgentActions,
      currentMonth
    };
  }, [students, settings.totalSeats]);

  const sendWhatsApp = (student: Student) => {
    const expiryDate = new Date(student.expiryDate);
    const formattedDate = expiryDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    const message = `Hello ${student.name},
Your library seat fee ends on ${formattedDate}. Please pay the fee before this date to continue using your seat.
– MyStudents`;
    
    const url = `https://wa.me/91${student.phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleMarkAsPaid = (student: Student) => {
    const now = new Date();
    const currentExpiry = new Date(student.expiryDate);
    
    // If student is already overdue, start new period from today
    // If student is paying in advance, extend their current expiry
    const baseDate = currentExpiry > now ? currentExpiry : now;
    
    const newExpiry = new Date(baseDate);
    newExpiry.setMonth(newExpiry.getMonth() + 1);
    
    updateStudent(student.id, {
      paymentStatus: 'Paid',
      startDate: now.toISOString().split('T')[0],
      expiryDate: newExpiry.toISOString().split('T')[0],
      lastPaymentDate: now.toISOString().split('T')[0],
    });
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="flex flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <div className="flex items-center gap-2">
            <p className="text-sm text-slate-500">Welcome back, {user?.name || 'Library Manager'}</p>
            {user?.isSubscribed ? (
              <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 border border-amber-100">
                Premium
              </span>
            ) : (
              <button 
                onClick={() => setShowTrialInfo(true)}
                className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 border border-indigo-100 transition-colors hover:bg-indigo-100 active:scale-95"
              >
                Free Trial
              </button>
            )}
          </div>
        </div>
        <button 
          onClick={logout}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 active:scale-95"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <MetricsCard 
          label="Active Students" 
          value={metrics.activeStudents} 
          icon={Users} 
          color="bg-indigo-500" 
        />
        <MetricsCard 
          label="Available Seats" 
          value={metrics.availableSeats} 
          icon={Armchair} 
          color="bg-emerald-500" 
          subtext={`${metrics.occupancyPercentage}% Full`}
        />
        <MetricsCard 
          label="Overdue Fees" 
          value={metrics.overdueStudentsCount} 
          icon={AlertCircle} 
          color="bg-rose-500" 
        />
        <MetricsCard 
          label={`Revenue (${metrics.currentMonth})`} 
          value={`₹${metrics.revenueThisMonth}`} 
          icon={IndianRupee} 
          color="bg-amber-500" 
        />
      </div>

      {/* Urgent Action List */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Urgent Actions</h2>
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-600 uppercase">
            {metrics.urgentActions.length} Critical
          </span>
        </div>
        
        <div className="flex flex-col gap-3 min-h-[100px]">
          <AnimatePresence mode="popLayout">
            {metrics.urgentActions.map((student) => (
              <motion.div 
                key={student.id} 
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: 20 }}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${student.paymentStatus === 'Overdue' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900">{student.name}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Desk {student.deskNumber} • {student.paymentStatus === 'Overdue' ? 'Payment Overdue' : `Fees Due Date: ${new Date(student.expiryDate).toLocaleDateString('en-GB')}`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => sendWhatsApp(student)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100 active:scale-95"
                    title="Send WhatsApp"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleMarkAsPaid(student)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition-colors hover:bg-indigo-100 active:scale-95"
                    title="Mark as Paid"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {metrics.urgentActions.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-8 text-center"
            >
              <div className="mb-2 rounded-full bg-slate-50 p-3 text-slate-300">
                <AlertCircle className="h-6 w-6" />
              </div>
              <p className="text-sm text-slate-400">All caught up! No urgent actions.</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link 
            href="/add" 
            className="flex flex-col items-center gap-2 rounded-2xl bg-indigo-600 p-4 text-white shadow-lg shadow-indigo-200 transition-transform active:scale-95"
          >
            <PlusCircle className="h-6 w-6" />
            <span className="text-xs font-bold uppercase tracking-wide">Add Student</span>
          </Link>
          <Link 
            href="/seats" 
            className="flex flex-col items-center gap-2 rounded-2xl bg-white border border-slate-100 p-4 text-slate-900 shadow-sm transition-transform active:scale-95"
          >
            <Armchair className="h-6 w-6 text-indigo-600" />
            <span className="text-xs font-bold uppercase tracking-wide">Manage Seats</span>
          </Link>
        </div>
      </section>

      {/* Trial Info Modal */}
      <AnimatePresence>
        {showTrialInfo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm overflow-hidden rounded-3xl bg-white p-6 shadow-2xl"
            >
              <div className="flex flex-col items-center gap-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                  <Clock className="h-8 w-8" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-bold text-slate-900">Free Trial Status</h3>
                  <p className="text-sm text-slate-500">
                    You are currently using the <span className="font-bold text-indigo-600">30-Day Free Trial</span>.
                  </p>
                </div>
                
                <div className="w-full space-y-4 rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Days Remaining</span>
                    <span className="text-lg font-bold text-indigo-600">{trialStatus.daysLeft} Days</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(trialStatus.daysLeft / 30) * 100}%` }}
                      className="h-full bg-indigo-600"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 w-full">
                  <button 
                    onClick={() => setShowTrialInfo(false)}
                    className="w-full rounded-2xl bg-indigo-600 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-indigo-200 transition-all active:scale-95"
                  >
                    Continue Exploring
                  </button>
                  <button 
                    onClick={() => {
                      setShowTrialInfo(false);
                      // Redirect to payment or show payment modal
                      // For now we just close it
                    }}
                    className="w-full rounded-2xl bg-white border border-slate-100 py-3 text-xs font-bold uppercase tracking-widest text-slate-400 transition-all hover:text-slate-600"
                  >
                    Upgrade to Premium
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}


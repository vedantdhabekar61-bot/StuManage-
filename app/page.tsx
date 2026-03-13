'use client';

import { Users, Armchair, AlertCircle, IndianRupee, Clock, ArrowRight, PlusCircle, MessageCircle, Check, X, ShieldCheck, Calendar, ChevronRight, Bell } from 'lucide-react';
import { MetricsCard } from '@/components/metrics-card';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '@/hooks/use-settings';
import { useStudents } from '@/hooks/use-students';
import { Student } from '@/lib/types';
import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatWhatsAppMessage, openWhatsApp, getWhatsAppUrl } from '@/lib/utils';
import { WhatsAppReminderButton } from '@/components/whatsapp-reminder-button';
import { SubscriptionBanner } from '@/components/subscription-banner';

import { useAuth } from '@/hooks/use-auth';
import { LogOut, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const { settings } = useSettings();
  const { students, isLoaded, updateStudent } = useStudents();
  const { logout, user, updateSubscription, isLoaded: authLoaded } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (authLoaded && !user) {
      router.push('/login');
    } else if (authLoaded && user && !user.isPro) {
      // Check if it's the first time (we can use a local storage flag for simplicity in this demo)
      const hasSeenTrial = localStorage.getItem('has_seen_trial');
      if (!hasSeenTrial) {
        localStorage.setItem('has_seen_trial', 'true');
        router.push('/trial');
      }
    }
  }, [user, authLoaded, router]);
  
  const handleStartTrial = async () => {
    await updateSubscription(true);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };
  
  const trialStatus = useMemo(() => {
    if (!user) return { daysLeft: 30 };
    const trialEnd = new Date(user.trialEndDate);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { daysLeft: Math.max(0, diffDays) };
  }, [user]);
  const metrics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeStudents = students.length;
    const availableSeats = settings.totalSeats - activeStudents;
    
    const overdueStudents = students.filter(s => {
      const expiry = new Date(s.expiryDate);
      expiry.setHours(0, 0, 0, 0);
      return (expiry < today && s.paymentStatus !== 'Paid') || s.paymentStatus === 'Overdue';
    });

    const pendingFees = students
      .filter(s => s.paymentStatus !== 'Paid' || new Date(s.expiryDate) < today)
      .reduce((acc, s) => acc + (Number(s.price) || 0), 0);

    const revenueThisMonth = students.reduce((acc, s) => acc + (s.paymentStatus === 'Paid' ? (Number(s.price) || 0) : 0), 0);
    const occupancyPercentage = settings.totalSeats > 0 ? Math.round((activeStudents / settings.totalSeats) * 100) : 0;
    
    const urgentActions = students.filter(s => {
      const expiry = new Date(s.expiryDate);
      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 3 || s.paymentStatus === 'Overdue' || (expiry < today && s.paymentStatus !== 'Paid');
    });

    const currentMonth = new Date().toLocaleString('default', { month: 'short' });

    return {
      activeStudents,
      availableSeats,
      overdueStudentsCount: overdueStudents.length,
      pendingFees,
      revenueThisMonth,
      occupancyPercentage,
      urgentActions,
      currentMonth
    };
  }, [students, settings.totalSeats]);

   const sendWhatsApp = (student: Student) => {
    const message = formatWhatsAppMessage(settings.messageTemplate, student, settings.libraryName);
    openWhatsApp(student, message);
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
    <main className="flex flex-col gap-6 pb-24">
      <SubscriptionBanner />
      <div className="px-6 flex flex-col gap-6">
        <header className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <div className="flex items-center gap-2">
            <p className="text-sm text-slate-500">Welcome back, {user?.name || 'Smart Tracking'}</p>
            {user?.isPro ? (
              <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 border border-amber-100">
                Premium
              </span>
            ) : (
              <button 
                onClick={handleStartTrial}
                className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 border border-indigo-100 transition-colors hover:bg-indigo-100 active:scale-95"
              >
                Free Trial
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleRefresh}
            className={`flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all active:scale-95 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`}
            title="Refresh"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <button 
            onClick={logout}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 active:scale-95"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Trial Info Card */}
      {!user?.isPro && trialStatus.daysLeft > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Calendar className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-tight">Free Trial Active</span>
              <span className="text-sm font-bold text-emerald-600">{trialStatus.daysLeft} Days Remaining</span>
            </div>
          </div>
          <Link 
            href="/billing"
            className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-white px-3 py-2 rounded-lg border border-emerald-100 shadow-sm active:scale-95"
          >
            Upgrade
          </Link>
        </motion.div>
      )}

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
          label="Pending Fees" 
          value={`₹${metrics.pendingFees.toLocaleString('en-IN')}`} 
          icon={AlertCircle} 
          color="bg-rose-500" 
          subtext={`${metrics.overdueStudentsCount} Overdue`}
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
                  <WhatsAppReminderButton
                    student={student}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg shadow-emerald-100 transition-all active:scale-95 disabled:opacity-50"
                  />
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
        <div className="grid grid-cols-3 gap-2">
          <Link 
            href="/add" 
            className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-indigo-600 p-3 text-white shadow-lg shadow-indigo-200 transition-transform active:scale-95"
          >
            <PlusCircle className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-tight text-center">Add Student</span>
          </Link>
          <Link 
            href="/reminders" 
            className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white border border-slate-100 p-3 text-slate-900 shadow-sm transition-transform active:scale-95"
          >
            <Bell className="h-5 w-5 text-amber-500" />
            <span className="text-[10px] font-bold uppercase tracking-tight text-center">Reminders</span>
          </Link>
          <Link 
            href="/seats" 
            className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white border border-slate-100 p-3 text-slate-900 shadow-sm transition-transform active:scale-95"
          >
            <Armchair className="h-5 w-5 text-indigo-600" />
            <span className="text-[10px] font-bold uppercase tracking-tight text-center">Seats</span>
          </Link>
        </div>
      </section>
      </div>
    </main>
  );
}


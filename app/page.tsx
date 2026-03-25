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
    <main className="flex min-h-screen flex-col bg-slate-50 pb-24">
      <SubscriptionBanner />
      
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-white shadow-sm">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'admin'}`} 
              alt="Profile" 
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-400">Good morning,</span>
            <span className="text-lg font-bold text-slate-900">{user?.name || 'Admin'}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition-all active:scale-95">
            <Bell className="h-5 w-5 text-slate-600" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 border-2 border-white"></span>
          </button>
          <button 
            onClick={logout}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm text-slate-600 transition-colors hover:text-rose-600 active:scale-95"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-8 px-6">
        {/* Metrics Grid */}
        <section className="grid grid-cols-2 gap-4">
          <MetricsCard 
            label="Active Students" 
            value={metrics.activeStudents} 
            icon={Users} 
          />
          <MetricsCard 
            label="Available Seats" 
            value={metrics.availableSeats} 
            icon={Armchair} 
          />
          <div className="col-span-2 soft-card p-5 flex items-center justify-between bg-teal-500 text-white border-none transition-all hover:scale-[1.01]">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium opacity-80">Total Revenue ({metrics.currentMonth})</span>
              <span className="text-3xl font-bold">₹{metrics.revenueThisMonth.toLocaleString('en-IN')}</span>
            </div>
            <div className="rounded-2xl bg-white/20 p-3">
              <IndianRupee className="h-8 w-8" />
            </div>
          </div>
        </section>

        {/* Action Alerts */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Action Alerts</h2>
            <Link href="/reminders" className="text-sm font-semibold text-teal-600">View All</Link>
          </div>
          
          <div className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
              {metrics.urgentActions.map((student) => (
                <motion.div 
                  key={student.id} 
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative overflow-hidden soft-card p-4 pl-6"
                >
                  <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-1.5",
                    student.paymentStatus === 'Overdue' ? "bg-rose-500" : "bg-amber-500"
                  )} />
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-slate-900">{student.name}</span>
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5">Desk {student.deskNumber}</span>
                        <span>•</span>
                        <span className={student.paymentStatus === 'Overdue' ? "text-rose-600" : "text-amber-600"}>
                          {student.paymentStatus === 'Overdue' ? 'Payment Overdue' : `Due: ${new Date(student.expiryDate).toLocaleDateString('en-GB')}`}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <WhatsAppReminderButton
                        student={student}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500 text-white shadow-lg shadow-teal-100 transition-all active:scale-95"
                      />
                      <button 
                        onClick={() => handleMarkAsPaid(student)}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-teal-50 hover:text-teal-600 active:scale-95"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {metrics.urgentActions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center soft-card border-dashed">
                <div className="mb-3 rounded-full bg-slate-50 p-4 text-slate-300">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <p className="font-medium text-slate-500">No urgent actions today!</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Floating Action Button */}
      <Link 
        href="/add" 
        className="fixed bottom-24 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-teal-500 text-white shadow-xl shadow-teal-200 transition-all hover:scale-110 active:scale-95"
      >
        <PlusCircle className="h-8 w-8" />
      </Link>
    </main>
  );
}


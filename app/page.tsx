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
import { formatWhatsAppMessage, openWhatsApp, getWhatsAppUrl, cn } from '@/lib/utils';
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
    <main className="flex min-h-screen flex-col bg-[#FDFBF7] pb-24">
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-8 pb-6 sticky top-0 bg-[#FDFBF7]/95 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-[#78716C]">Good morning,</span>
            <span className="text-xl font-extrabold text-[#1C1917] tracking-tight">{user?.name || 'Admin'}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[0_4px_14px_rgba(28,25,23,0.05)] transition-all active:scale-95">
            <Bell className="h-5 w-5 text-[#1C1917]" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-[#F59E0B]"></span>
          </button>
          <button 
            onClick={logout}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[0_4px_14px_rgba(28,25,23,0.05)] text-[#1C1917] transition-colors hover:text-rose-600 active:scale-95"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      <SubscriptionBanner />

      <div className="flex flex-col gap-8 px-6">
        {/* Primary Metric: Revenue */}
        <section>
          <div className="bg-white rounded-[2.5rem] p-6 shadow-[0_8px_30px_rgba(14,164,149,0.08)] border border-primary/5 flex items-center justify-between transition-all hover:scale-[1.01]">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <IndianRupee className="h-8 w-8" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#78716C] uppercase tracking-widest">Monthly Revenue</p>
                <p className="text-3xl font-black text-[#1C1917] tracking-tight">₹{metrics.revenueThisMonth.toLocaleString('en-IN')}</p>
              </div>
            </div>
            <Link href="/reminders" className="w-10 h-10 rounded-full bg-[#FDFBF7] flex items-center justify-center text-primary active:scale-95 transition-transform">
              <ChevronRight className="h-6 w-6" />
            </Link>
          </div>
        </section>

        {/* Secondary Metrics Grid */}
        <section className="grid grid-cols-2 gap-4">
          <MetricsCard 
            label="Active Students" 
            value={metrics.activeStudents} 
            icon={Users} 
            trend="+4 this week"
          />
          <MetricsCard 
            label="Available Seats" 
            value={metrics.availableSeats} 
            icon={Armchair} 
          />
        </section>

        {/* Action Alerts */}
        <section className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-[#1C1917] flex items-center gap-2">
              Action Alerts
              <span className="bg-[#F59E0B]/20 text-[#F59E0B] text-[10px] font-bold px-2 py-0.5 rounded-full">
                {metrics.urgentActions.length} Pending
              </span>
            </h2>
            <Link href="/reminders" className="text-sm font-bold text-primary">View All</Link>
          </div>
          
          <div className="flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {metrics.urgentActions.map((student) => (
                <motion.div 
                  key={student.id} 
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[#FFFBEB] border-l-4 border-[#F59E0B] rounded-2xl p-4 shadow-sm flex items-center justify-between active:bg-[#FFF8D6] transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full shadow-sm flex items-center justify-center font-bold text-sm shrink-0",
                      student.id.charCodeAt(0) % 3 === 0 ? "bg-teal-100 text-primary" : 
                      student.id.charCodeAt(0) % 3 === 1 ? "bg-orange-100 text-orange-600" : 
                      "bg-blue-100 text-blue-600"
                    )}>
                      {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-[#1C1917] text-base leading-tight">{student.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-[#78716C] bg-white px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wider">
                          Seat {student.deskNumber}
                        </span>
                        <span className="text-[10px] font-extrabold text-[#F59E0B] flex items-center gap-0.5 uppercase tracking-wider">
                          <AlertCircle className="h-3 w-3" />
                          ₹{student.price} Due
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <WhatsAppReminderButton
                      student={student}
                      className="w-10 h-10 rounded-full bg-[#25D366] text-white shadow-md flex items-center justify-center active:scale-95 transition-transform shrink-0"
                    />
                    <button 
                      onClick={() => handleMarkAsPaid(student)}
                      className="w-10 h-10 rounded-full bg-white text-[#78716C] shadow-sm flex items-center justify-center transition-colors hover:text-primary active:scale-95"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {metrics.urgentActions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-2xl border-2 border-dashed border-[#dee4e1]">
                <div className="mb-3 rounded-full bg-[#FDFBF7] p-4 text-[#dee4e1]">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <p className="font-bold text-[#78716C]">No urgent actions today!</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-24 left-0 right-0 mx-auto max-w-md px-5 flex justify-end pointer-events-none z-20">
        <button 
          onClick={() => router.push('/add')}
          className="bg-primary text-white shadow-lg shadow-primary/30 rounded-full h-14 px-5 flex items-center justify-center gap-2 active:scale-95 transition-transform font-bold tracking-wide pointer-events-auto"
        >
          <PlusCircle className="h-6 w-6" />
          Add Student
        </button>
      </div>
    </main>
  );
}


'use client';

import { Users, Armchair, IndianRupee, Edit2, LogOut, ChevronRight, Check, ShieldCheck, PlusCircle, X, Zap } from 'lucide-react';
import { MetricsCard } from '@/components/metrics-card';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '@/hooks/use-settings';
import { useStudents } from '@/hooks/use-students';
import { Student } from '@/lib/types';
import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn, isStudentOverdue } from '@/lib/utils';
import { WhatsAppReminderButton } from '@/components/whatsapp-reminder-button';
import { SubscriptionBanner } from '@/components/subscription-banner';
import { useAuth } from '@/hooks/use-auth';
import { Logo } from '@/components/logo';

export default function Dashboard() {
  const router = useRouter();
  const { settings, updateSettings, isLoaded: settingsLoaded } = useSettings();
  const { students, isLoaded: studentsLoaded, updateStudent } = useStudents();
  const { logout, user, isLoaded: authLoaded } = useAuth();
  const [isEditingLibrary, setIsEditingLibrary] = useState(false);
  const [newLibraryName, setNewLibraryName] = useState(settings.libraryName);

  useEffect(() => {
    if (authLoaded && !user) {
      router.push('/login');
    } else if (authLoaded && user && user.subscription?.status === 'trial') {
      const hasSeenTrial = localStorage.getItem('has_seen_trial');
      if (!hasSeenTrial) {
        localStorage.setItem('has_seen_trial', 'true');
        router.push('/trial');
      }
    }
  }, [user, authLoaded, router]);

  const metrics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeStudents = students.length;
    const availableSeats = Math.max(0, settings.totalSeats - activeStudents);
    
    const overdueStudents = students.filter(isStudentOverdue);

    const pendingFees = students
      .filter(s => s.paymentStatus !== 'Paid' || isStudentOverdue(s))
      .reduce((acc, s) => acc + (Number(s.price) || 0), 0);

    const revenueThisMonth = students.reduce((acc, s) => acc + (s.paymentStatus === 'Paid' ? (Number(s.price) || 0) : 0), 0);
    const occupancyPercentage = settings.totalSeats > 0 ? Math.round((activeStudents / settings.totalSeats) * 100) : 0;
    
    const urgentActions = students.filter(s => {
      const isOverdue = isStudentOverdue(s);
      if (isOverdue) return true;

      // If not overdue, but already Paid, it's not urgent
      if (s.paymentStatus === 'Paid') return false;

      const expiry = new Date(s.expiryDate);
      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 3;
    });

    return {
      activeStudents,
      availableSeats,
      overdueStudentsCount: overdueStudents.length,
      pendingFees,
      revenueThisMonth,
      occupancyPercentage,
      urgentActions
    };
  }, [students, settings.totalSeats]);

  const handleMarkAsPaid = async (student: Student) => {
    const now = new Date();
    const currentExpiry = new Date(student.expiryDate);
    const baseDate = currentExpiry > now ? currentExpiry : now;
    
    const newExpiry = new Date(baseDate);
    newExpiry.setMonth(newExpiry.getMonth() + 1);
    
    try {
      await updateStudent(student.id, {
        paymentStatus: 'Paid',
        expiryDate: newExpiry.toISOString().split('T')[0],
        lastPaymentDate: now.toISOString().split('T')[0],
      });
    } catch (e) {
      console.error('Failed to mark as paid', e);
    }
  };

  if (!authLoaded || !studentsLoaded || !settingsLoaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#FDFBF7] pb-24">
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-8 pb-6 sticky top-0 bg-[#FDFBF7]/95 backdrop-blur-sm z-10">
        <div className="flex items-center gap-4">
          <Logo size={42} />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-[#78716C]">Good morning,</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-[#1C1917] tracking-tight truncate max-w-[120px]">{user?.name || 'Admin'}</span>
            </div>
            <button 
              onClick={() => {
                setNewLibraryName(settings.libraryName);
                setIsEditingLibrary(true);
              }}
              className="flex items-center gap-1.5 mt-0.5 group"
            >
              <div className="flex items-center gap-1 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/10 transition-colors group-hover:bg-teal-500/20">
                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider truncate max-w-[100px]">
                  {settings.libraryName}
                </span>
                <Edit2 className="h-2 w-2 text-teal-600/50" />
              </div>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/billing"
            className="flex h-10 items-center gap-2 rounded-full bg-amber-500/10 px-4 text-amber-600 transition-all hover:bg-amber-500/20 active:scale-95"
          >
            <Zap className="h-4 w-4 fill-current" />
            <span className="text-[10px] font-black uppercase tracking-widest">Upgrade</span>
          </Link>
          <button 
            onClick={logout}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm text-[#1C1917] transition-colors hover:text-rose-600 active:scale-95"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      <SubscriptionBanner />

      <div className="flex flex-col gap-8 px-6 mt-4">
        {/* Primary Metric: Revenue */}
        <section>
          <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-teal-500/5 flex items-center justify-between transition-all hover:scale-[1.01]">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-teal-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
                <IndianRupee className="h-8 w-8" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#78716C] uppercase tracking-widest">Monthly Revenue</p>
                <p className="text-3xl font-black text-[#1C1917] tracking-tight">₹{metrics.revenueThisMonth.toLocaleString('en-IN')}</p>
              </div>
            </div>
            <Link href="/reminders" className="w-10 h-10 rounded-full bg-[#FDFBF7] flex items-center justify-center text-teal-600 active:scale-95 transition-transform">
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
              <span className="bg-amber-500/20 text-amber-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {metrics.urgentActions.length} Pending
              </span>
            </h2>
            <Link href="/reminders" className="text-sm font-bold text-teal-600">View All</Link>
          </div>
          
          <div className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
              {metrics.urgentActions.map((student) => {
                const isOverdue = isStudentOverdue(student);
                const daysLeft = Math.ceil((new Date(student.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <motion.div 
                    key={student.id} 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4 transition-all hover:scale-[1.01]"
                  >
                    {/* Top Row: Name + Amount */}
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900 text-lg">{student.studentName}</p>
                      <p className="font-bold text-slate-900 text-lg">₹{student.price}</p>
                    </div>

                    {/* Middle Row: Seat + Status */}
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-500">Seat {student.deskNumber}</p>
                      <p className={cn(
                        "text-sm font-bold",
                        isOverdue ? "text-rose-600" : "text-amber-600"
                      )}>
                        {isOverdue ? `${Math.abs(daysLeft)}d overdue` : `Due in ${daysLeft}d`}
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-slate-50 w-full" />

                    {/* Bottom Section: Stacked Actions */}
                    <div className="flex flex-col gap-2.5">
                      <WhatsAppReminderButton
                        student={student}
                        showText={true}
                        className="w-full h-12 rounded-2xl bg-[#25D366] text-white shadow-lg shadow-[#25D366]/10 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest active:scale-[0.98] transition-all"
                      />
                      <button 
                        onClick={() => handleMarkAsPaid(student)}
                        className="w-full h-12 rounded-2xl bg-white text-slate-600 border border-slate-200 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-all hover:bg-slate-50 active:scale-95"
                      >
                        <Check className="h-4 w-4" />
                        Mark as Paid
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {metrics.urgentActions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
                <div className="mb-3 rounded-full bg-[#FDFBF7] p-4 text-slate-200">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <p className="font-bold text-[#78716C]">No urgent actions today!</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-28 left-0 right-0 mx-auto max-w-md px-5 flex justify-end pointer-events-none z-[40]">
        <button 
          onClick={() => router.push('/add')}
          className="bg-teal-500 text-white shadow-lg shadow-teal-500/30 rounded-full h-14 px-5 flex items-center justify-center gap-2 active:scale-95 transition-transform font-bold tracking-wide pointer-events-auto"
        >
          <PlusCircle className="h-6 w-6" />
          Add Student
        </button>
      </div>

      {/* Edit Library Name Modal */}
      <AnimatePresence>
        {isEditingLibrary && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditingLibrary(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm rounded-[2.5rem] bg-white p-8 shadow-2xl"
            >
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Institute Name</h3>
                  <button 
                    onClick={() => setIsEditingLibrary(false)}
                    className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Library / Institute Name
                  </label>
                  <input 
                    type="text"
                    value={newLibraryName}
                    onChange={(e) => setNewLibraryName(e.target.value)}
                    placeholder="e.g. Modern Study Library"
                    className="w-full rounded-2xl bg-slate-50 border-none px-5 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-teal-500/20 transition-all"
                    autoFocus
                  />
                </div>

                <button 
                  onClick={() => {
                    updateSettings({ libraryName: newLibraryName });
                    setIsEditingLibrary(false);
                  }}
                  className="w-full h-14 rounded-2xl bg-teal-500 text-white font-black uppercase tracking-widest shadow-lg shadow-teal-500/20 active:scale-95 transition-transform"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

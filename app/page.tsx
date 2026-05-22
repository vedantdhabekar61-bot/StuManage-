'use client';

import { Users, Armchair, IndianRupee, Edit2, LogOut, ChevronRight, Check, ShieldCheck, PlusCircle, X, Zap, Clock, RefreshCw } from 'lucide-react';
import { MetricsCard } from '@/components/metrics-card';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
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

// Helper to reliably get YYYY-MM-DD in local time, preventing IST to UTC date shifts
const toLocalDateString = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().split('T')[0];
};

export default function Dashboard() {
  const router = useRouter();
  const { settings, updateSettings, isLoaded: settingsLoaded } = useSettings();
  const { students, isLoaded: studentsLoaded, updateStudent, refreshStudents } = useStudents();
  const { logout, user, isLoaded: authLoaded } = useAuth();
  const [isEditingLibrary, setIsEditingLibrary] = useState(false);
  const [newLibraryName, setNewLibraryName] = useState(settings.libraryName);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const { scrollY } = useScroll();
  const pullDistance = 80;
  const refreshOpacity = useTransform(scrollY, [-pullDistance, 0], [1, 0]);
  const refreshScale = useTransform(scrollY, [-pullDistance, 0], [1, 0.5]);

  useEffect(() => {
    const handleScroll = async () => {
      if (window.scrollY < -pullDistance && !isRefreshing) {
        setIsRefreshing(true);
        await refreshStudents();
        setIsRefreshing(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isRefreshing, refreshStudents]);

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
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const activeStudents = students.length;
    const availableSeats = Math.max(0, settings.totalSeats - activeStudents);
    
    const overdueStudents = students.filter(isStudentOverdue);

    const pendingFees = students
      .filter(s => s.paymentStatus !== 'Paid')
      .reduce((acc, s) => acc + (Number(s.price) || 0), 0);

    // FIX 1: Only sum revenue for payments made in the current calendar month
    const revenueThisMonth = students.reduce((acc, s) => {
      if (s.paymentStatus === 'Paid' && s.lastPaymentDate) {
        const paymentDate = new Date(s.lastPaymentDate);
        if (paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear) {
          return acc + (Number(s.price) || 0);
        }
      }
      return acc;
    }, 0);

    const occupancyPercentage = settings.totalSeats > 0 ? Math.round((activeStudents / settings.totalSeats) * 100) : 0;
    
    const urgentActions = students.filter(s => {
      const isOverdue = isStudentOverdue(s);
      if (isOverdue) return true;

      if (s.paymentStatus === 'Pending') return true;

      if (s.paymentStatus === 'Paid') {
        const expiry = new Date(s.expiryDate);
        expiry.setHours(0, 0, 0, 0); // FIX 2: Normalize to midnight to prevent Math.ceil timezone jumps
        
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 3 && diffDays >= 0;
      }

      return false;
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
    const expectedMonth = (newExpiry.getMonth() + 1) % 12;
    newExpiry.setMonth(newExpiry.getMonth() + 1);
    
    // FIX 3: Handle 31st to 28th/30th rollover (e.g., Jan 31 -> Feb 28, not Mar 3)
    if (newExpiry.getMonth() !== expectedMonth) {
      newExpiry.setDate(0); 
    }
    
    try {
      // FIX 4: Use toLocalDateString to prevent IST shifting to yesterday in UTC
      await updateStudent(student.id, {
        paymentStatus: 'Paid',
        expiryDate: toLocalDateString(newExpiry),
        lastPaymentDate: toLocalDateString(now),
      });
    } catch (e) {
      console.error('Failed to mark as paid', e);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshStudents();
    setIsRefreshing(false);
  };

  if (!authLoaded || !studentsLoaded || !settingsLoaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-background pb-24">
      {/* Pull to Refresh Indicator */}
      <motion.div 
        style={{ opacity: refreshOpacity, scale: refreshScale }}
        className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
      >
        <div className="bg-primary text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          {isRefreshing ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Clock className="h-4 w-4" />
          )}
          <span className="text-[10px] font-bold uppercase tracking-widest">
            {isRefreshing ? 'Updating...' : 'Pull to refresh'}
          </span>
        </div>
      </motion.div>

      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 pt-8 pb-4 sticky top-0 bg-[#FDFBF7]/95 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3 min-w-0">
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="shrink-0 active:scale-95 transition-transform"
            aria-label="Profile"
            title="Log out"
          >
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-lg font-bold shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
          </button>
          <div className="flex flex-col min-w-0 shrink">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Namaste,</span>
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="text-xl font-bold text-slate-900 tracking-tight truncate flex-1">{user?.name || 'Admin'}</span>
            </div>
            <button 
              onClick={() => {
                setNewLibraryName(settings.libraryName);
                setIsEditingLibrary(true);
              }}
              className="flex items-center gap-1.5 mt-0.5 group shrink-0 min-w-0"
            >
              <div className="flex items-center gap-1 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/10 transition-colors group-hover:bg-teal-500/20 max-w-full">
                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider truncate">
                  {settings.libraryName}
                </span>
                <Edit2 className="h-2 w-2 shrink-0 text-teal-600/50" />
              </div>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 pl-2">
          {/* FIX 5: Manual refresh button for non-iOS devices */}
          <button 
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className={cn("flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 active:scale-95", isRefreshing && "animate-spin text-primary")}
            aria-label="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <Link 
            href="/billing"
            className="flex h-10 w-10 sm:w-auto items-center justify-center sm:px-4 gap-2 rounded-full bg-teal-50 text-teal-600 transition-all hover:bg-teal-100 active:scale-95"
            aria-label="Upgrade to Pro"
            title="Upgrade"
          >
            <Zap className="h-4 w-4 fill-current shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Upgrade</span>
          </Link>
        </div>
      </header>

      <SubscriptionBanner />

      <div className="flex flex-col gap-8 px-6 mt-4">
        {/* Primary Metric: Revenue */}
        <section>
          <div className="bg-card rounded-[2.5rem] p-6 shadow-soft border border-primary/5 flex items-center justify-between transition-all hover:scale-[1.01]">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <IndianRupee className="h-8 w-8" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted uppercase tracking-widest">Monthly Income</p>
                <p className="text-3xl font-black text-foreground tracking-tight">₹{metrics.revenueThisMonth.toLocaleString('en-IN')}</p>
              </div>
            </div>
            <Link href="/reminders" className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-primary active:scale-95 transition-transform">
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
            <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2">
              Action Alerts
              <span className="bg-accent/20 text-accent text-[10px] font-bold px-2 py-0.5 rounded-full">
                {metrics.urgentActions.length} Pending
              </span>
            </h2>
            <Link href="/reminders" className="text-sm font-bold text-primary">View All</Link>
          </div>
          
          <div className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
              {metrics.urgentActions.map((student) => {
                const isOverdue = isStudentOverdue(student);
                
                // Normalizing dates for display to ensure absolute accuracy
                const expiryDate = new Date(student.expiryDate);
                expiryDate.setHours(0, 0, 0, 0);
                const todayDate = new Date();
                todayDate.setHours(0, 0, 0, 0);
                const daysLeft = Math.round((expiryDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <motion.div 
                    key={student.id} 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-card rounded-3xl p-5 shadow-soft border border-border/5 flex flex-col gap-4 transition-all hover:scale-[1.01]"
                  >
                    {/* Top Row: Name + Amount */}
                    <div className="flex items-center justify-between">
                      <p className="font-extrabold text-foreground text-lg">{student.studentName}</p>
                      <p className="font-extrabold text-foreground text-lg">₹{student.price}</p>
                    </div>

                    {/* Middle Row: Seat + Status */}
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-muted">Seat {student.deskNumber}</p>
                      <p className={cn(
                        "text-sm font-black",
                        isOverdue ? "text-rose-600" : (student.paymentStatus === 'Pending' ? "text-amber-500" : "text-accent")
                      )}>
                        {isOverdue ? `${Math.abs(daysLeft)}d overdue` : (student.paymentStatus === 'Pending' ? "Payment Pending" : `Due in ${daysLeft}d`)}
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-border/20 w-full" />

                    {/* Bottom Section: Stacked Actions */}
                    <div className="flex flex-col gap-2.5">
                      <WhatsAppReminderButton
                        student={student}
                        showText={true}
                        className="w-full h-12 rounded-2xl bg-[#25D366] text-white shadow-lg shadow-[#25D366]/10 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest active:scale-[0.98] transition-all"
                      />
                      <button 
                        onClick={() => handleMarkAsPaid(student)}
                        className="w-full h-12 rounded-2xl bg-background text-muted border border-border/50 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest transition-all hover:bg-muted/5 active:scale-95"
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
              <div className="flex flex-col items-center justify-center py-12 text-center bg-card rounded-[2rem] border border-dashed border-border/50">
                <div className="mb-3 rounded-full bg-background p-4 text-muted/30">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <p className="font-bold text-muted">No urgent actions today!</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-24 left-0 right-0 mx-auto max-w-md px-5 flex justify-end pointer-events-none z-[60]">
        <button 
          onClick={() => router.push('/add')}
          className="bg-primary text-white shadow-xl shadow-primary/30 rounded-full h-14 px-6 flex items-center justify-center gap-2 active:scale-95 transition-transform font-bold tracking-wide pointer-events-auto"
        >
          <PlusCircle className="h-6 w-6" />
          <span>Add Student</span>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm rounded-[2.5rem] bg-card p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="h-8 w-8 ml-1" />
              </div>
              <h3 className="text-xl font-black text-foreground mb-2">Log Out?</h3>
              <p className="text-sm font-semibold text-muted mb-6">
                Are you sure you want to log out of your account?
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 rounded-2xl bg-background py-4 text-[13px] font-black uppercase tracking-widest text-muted active:scale-95 transition-transform"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    logout();
                  }}
                  className="flex-1 rounded-2xl bg-rose-600 py-4 text-[13px] font-black uppercase tracking-widest text-white shadow-lg shadow-rose-200 active:scale-95 transition-transform"
                >
                  Log Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Library Name Modal */}
      <AnimatePresence>
        {isEditingLibrary && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditingLibrary(false)}
              className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm rounded-[2.5rem] bg-card p-8 shadow-2xl"
            >
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-foreground tracking-tight">Institute Name</h3>
                  <button 
                    onClick={() => setIsEditingLibrary(false)}
                    className="h-11 w-11 rounded-full bg-background flex items-center justify-center text-muted active:scale-95 transition-transform"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">
                    Library / Institute Name
                  </label>
                  <input 
                    type="text"
                    value={newLibraryName}
                    onChange={(e) => setNewLibraryName(e.target.value)}
                    placeholder="e.g. Modern Study Library"
                    className="w-full rounded-2xl bg-background border-none px-5 py-4 text-sm font-bold text-foreground focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted/50"
                    autoFocus
                  />
                </div>

                <button 
                  onClick={() => {
                    updateSettings({ libraryName: newLibraryName });
                    setIsEditingLibrary(false);
                  }}
                  className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-transform"
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

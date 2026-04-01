'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MessageCircle,
  Search,
  IndianRupee,
  Bell,
  Users,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStudents } from '@/hooks/use-students';
import { useSettings } from '@/hooks/use-settings';
import { Student } from '@/lib/types';
import { formatWhatsAppMessage, openWhatsApp, getWhatsAppUrl, cn } from '@/lib/utils';
import { WhatsAppReminderButton } from '@/components/whatsapp-reminder-button';
import { BulkReminderSheet } from '@/components/bulk-reminder-sheet';

type FilterType = 'All' | 'Overdue' | 'Paid';

export default function RemindersPage() {
  const router = useRouter();
  const { students, isLoaded } = useStudents();
  const { settings } = useSettings();
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isBulkOpen, setIsBulkOpen] = useState(false);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch =
        student.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.phoneNumber.includes(searchQuery);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(student.expiryDate);
      dueDate.setHours(0, 0, 0, 0);

      const isOverdue = student.paymentStatus === 'Overdue';
      const isPaid = student.paymentStatus === 'Paid';

      if (activeFilter === 'Overdue') return matchesSearch && isOverdue;
      if (activeFilter === 'Paid') return matchesSearch && isPaid;
      return matchesSearch;
    });
  }, [students, searchQuery, activeFilter]);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueStudents = students.filter(s => {
      const dueDate = new Date(s.expiryDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today && s.paymentStatus !== 'Paid';
    });

    const paidThisMonthCount = students.filter(s => s.paymentStatus === 'Paid').length;

    const totalPendingAmount = students
      .filter(s => s.paymentStatus !== 'Paid' || new Date(s.expiryDate) < today)
      .reduce((acc, s) => acc + (Number(s.price) || 0), 0);

    return {
      overdueCount: overdueStudents.length,
      paidThisMonthCount,
      totalPendingAmount
    };
  }, [students]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-slate-50 pb-24">

      {/* Header */}
      <header className="flex flex-col gap-6 px-6 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm text-slate-500 transition-all active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-slate-900">Fee Reminders</h1>
          <button
            onClick={() => setIsBulkOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500 text-white shadow-lg shadow-teal-100 transition-all active:scale-95"
            title="Bulk Send"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="soft-card p-4 flex flex-col items-center gap-1 border-rose-100 bg-rose-50/30">
            <span className="text-2xl font-bold text-rose-600">{stats.overdueCount}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400">Overdue</span>
          </div>
          <div className="soft-card p-4 flex flex-col items-center gap-1 border-teal-100 bg-teal-50/30">
            <span className="text-2xl font-bold text-teal-600">{stats.paidThisMonthCount}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-teal-400">Paid</span>
          </div>
        </div>

        {/* Pending Amount Banner */}
        <div className="soft-card p-6 flex items-center justify-between bg-teal-500 text-white border-none shadow-xl shadow-teal-100">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium opacity-80 uppercase tracking-widest">Total Pending Fees</span>
            <span className="text-3xl font-bold">₹{stats.totalPendingAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="rounded-2xl bg-white/20 p-3">
            <IndianRupee className="h-8 w-8" />
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border-none bg-white py-4 pl-12 pr-4 text-sm font-medium shadow-sm focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
            />
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {(['All', 'Overdue', 'Paid'] as FilterType[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "rounded-full px-6 py-2 text-xs font-bold transition-all active:scale-95 whitespace-nowrap",
                  activeFilter === filter
                    ? "bg-teal-500 text-white shadow-lg shadow-teal-100"
                    : "bg-white text-slate-500 shadow-sm"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Student List */}
      <div className="flex flex-col gap-4 px-6 min-h-[200px]">
        <AnimatePresence mode="popLayout">
          {filteredStudents.map((student) => (
            <motion.div
              key={student.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="soft-card p-5 flex flex-col gap-4 transition-all hover:scale-[1.01]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-14 w-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-sm",
                    student.paymentStatus === 'Paid' ? "bg-teal-50 text-teal-600" : "bg-rose-50 text-rose-600"
                  )}>
                    {student.studentName.charAt(0)}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-slate-900">{student.studentName}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Desk {student.deskNumber} • {student.phoneNumber}
                    </span>
                  </div>
                </div>
                <div className={cn(
                  "status-pill",
                  student.paymentStatus === 'Paid' ? "bg-teal-100 text-teal-700" :
                  student.paymentStatus === 'Overdue' ? "bg-rose-100 text-rose-700" :
                  "bg-amber-100 text-amber-700"
                )}>
                  {student.paymentStatus}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Due Date</span>
                  <span className="text-sm font-bold text-slate-700">
                    {new Date(student.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long' })}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Fee Amount</span>
                  <span className="text-lg font-bold text-teal-600">₹{student.price}</span>
                </div>
              </div>

              {student.paymentStatus !== 'Paid' && (
                <WhatsAppReminderButton
                  student={student}
                  className="flex items-center justify-center gap-3 w-full rounded-2xl bg-[#25D366] py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-[#25D366]/20 transition-all active:scale-95 disabled:opacity-50"
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        <BulkReminderSheet
          students={students}
          isOpen={isBulkOpen}
          onClose={() => setIsBulkOpen(false)}
        />

        {filteredStudents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-slate-100 p-4 text-slate-300">
              <Bell className="h-8 w-8" />
            </div>
            <p className="text-sm font-medium text-slate-400">No students found for this filter.</p>
          </div>
        )}
      </div>

    </main>
  );
}'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MessageCircle,
  Search,
  IndianRupee,
  Bell,
  Users,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStudents } from '@/hooks/use-students';
import { useSettings } from '@/hooks/use-settings';
import { Student } from '@/lib/types';
import { formatWhatsAppMessage, openWhatsApp, getWhatsAppUrl, cn } from '@/lib/utils';
import { WhatsAppReminderButton } from '@/components/whatsapp-reminder-button';
import { BulkReminderSheet } from '@/components/bulk-reminder-sheet';

type FilterType = 'All' | 'Overdue' | 'Paid';

export default function RemindersPage() {
  const router = useRouter();
  const { students, isLoaded } = useStudents();
  const { settings } = useSettings();
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isBulkOpen, setIsBulkOpen] = useState(false);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch =
        student.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.phoneNumber.includes(searchQuery);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(student.expiryDate);
      dueDate.setHours(0, 0, 0, 0);

      const isOverdue = student.paymentStatus === 'Overdue';
      const isPaid = student.paymentStatus === 'Paid';

      if (activeFilter === 'Overdue') return matchesSearch && isOverdue;
      if (activeFilter === 'Paid') return matchesSearch && isPaid;
      return matchesSearch;
    });
  }, [students, searchQuery, activeFilter]);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueStudents = students.filter(s => {
      const dueDate = new Date(s.expiryDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today && s.paymentStatus !== 'Paid';
    });

    const paidThisMonthCount = students.filter(s => s.paymentStatus === 'Paid').length;

    const totalPendingAmount = students
      .filter(s => s.paymentStatus !== 'Paid' || new Date(s.expiryDate) < today)
      .reduce((acc, s) => acc + (Number(s.price) || 0), 0);

    return {
      overdueCount: overdueStudents.length,
      paidThisMonthCount,
      totalPendingAmount
    };
  }, [students]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-slate-50 pb-24">

      {/* Header */}
      <header className="flex flex-col gap-6 px-6 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm text-slate-500 transition-all active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-slate-900">Fee Reminders</h1>
          <button
            onClick={() => setIsBulkOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500 text-white shadow-lg shadow-teal-100 transition-all active:scale-95"
            title="Bulk Send"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="soft-card p-4 flex flex-col items-center gap-1 border-rose-100 bg-rose-50/30">
            <span className="text-2xl font-bold text-rose-600">{stats.overdueCount}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400">Overdue</span>
          </div>
          <div className="soft-card p-4 flex flex-col items-center gap-1 border-teal-100 bg-teal-50/30">
            <span className="text-2xl font-bold text-teal-600">{stats.paidThisMonthCount}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-teal-400">Paid</span>
          </div>
        </div>

        {/* Pending Amount Banner */}
        <div className="soft-card p-6 flex items-center justify-between bg-teal-500 text-white border-none shadow-xl shadow-teal-100">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium opacity-80 uppercase tracking-widest">Total Pending Fees</span>
            <span className="text-3xl font-bold">₹{stats.totalPendingAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="rounded-2xl bg-white/20 p-3">
            <IndianRupee className="h-8 w-8" />
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border-none bg-white py-4 pl-12 pr-4 text-sm font-medium shadow-sm focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
            />
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {(['All', 'Overdue', 'Paid'] as FilterType[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "rounded-full px-6 py-2 text-xs font-bold transition-all active:scale-95 whitespace-nowrap",
                  activeFilter === filter
                    ? "bg-teal-500 text-white shadow-lg shadow-teal-100"
                    : "bg-white text-slate-500 shadow-sm"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Student List */}
      <div className="flex flex-col gap-4 px-6 min-h-[200px]">
        <AnimatePresence mode="popLayout">
          {filteredStudents.map((student) => (
            <motion.div
              key={student.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="soft-card p-5 flex flex-col gap-4 transition-all hover:scale-[1.01]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-14 w-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-sm",
                    student.paymentStatus === 'Paid' ? "bg-teal-50 text-teal-600" : "bg-rose-50 text-rose-600"
                  )}>
                    {student.studentName.charAt(0)}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-slate-900">{student.studentName}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Desk {student.deskNumber} • {student.phoneNumber}
                    </span>
                  </div>
                </div>
                <div className={cn(
                  "status-pill",
                  student.paymentStatus === 'Paid' ? "bg-teal-100 text-teal-700" :
                  student.paymentStatus === 'Overdue' ? "bg-rose-100 text-rose-700" :
                  "bg-amber-100 text-amber-700"
                )}>
                  {student.paymentStatus}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Due Date</span>
                  <span className="text-sm font-bold text-slate-700">
                    {new Date(student.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long' })}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Fee Amount</span>
                  <span className="text-lg font-bold text-teal-600">₹{student.price}</span>
                </div>
              </div>

              {student.paymentStatus !== 'Paid' && (
                <WhatsAppReminderButton
                  student={student}
                  className="flex items-center justify-center gap-3 w-full rounded-2xl bg-[#25D366] py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-[#25D366]/20 transition-all active:scale-95 disabled:opacity-50"
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        <BulkReminderSheet
          students={students}
          isOpen={isBulkOpen}
          onClose={() => setIsBulkOpen(false)}
        />

        {filteredStudents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-slate-100 p-4 text-slate-300">
              <Bell className="h-8 w-8" />
            </div>
            <p className="text-sm font-medium text-slate-400">No students found for this filter.</p>
          </div>
        )}
      </div>

    </main>
  );
}

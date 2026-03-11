'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  MessageCircle, 
  Search,
  IndianRupee,
  Bell,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStudents } from '@/hooks/use-students';
import { useSettings } from '@/hooks/use-settings';
import { Student } from '@/lib/types';

type FilterType = 'All' | 'Due Today' | 'Overdue' | 'Paid';

export default function RemindersPage() {
  const router = useRouter();
  const { students, isLoaded } = useStudents();
  const { settings } = useSettings();
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           student.phone.includes(searchQuery);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(student.expiryDate);
      dueDate.setHours(0, 0, 0, 0);

      const isDueToday = dueDate.getTime() === today.getTime() && student.paymentStatus !== 'Paid';
      const isOverdue = student.paymentStatus === 'Overdue';
      const isPaid = student.paymentStatus === 'Paid';

      if (activeFilter === 'Due Today') return matchesSearch && isDueToday;
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

    const dueTodayStudents = students.filter(s => {
      const dueDate = new Date(s.expiryDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime() && s.paymentStatus !== 'Paid';
    });

    const paidThisMonthCount = students.filter(s => s.paymentStatus === 'Paid').length;
    
    const totalPendingAmount = students
      .filter(s => s.paymentStatus !== 'Paid' || new Date(s.expiryDate) < today)
      .reduce((acc, s) => acc + (Number(s.price) || 0), 0);

    return { 
      overdueCount: overdueStudents.length, 
      dueTodayCount: dueTodayStudents.length, 
      paidThisMonthCount, 
      totalPendingAmount 
    };
  }, [students]);

  // --- NEW WHATSAPP LOGIC ---
  const generateWhatsAppLink = (student: Student) => {
    // 1. Format the date to be easily readable (e.g., 15 October 2025)
    const formattedDate = new Date(student.expiryDate).toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'long',
      year: 'numeric'
    });
    
    // 2. Build the exact message template you requested using template literals (\n creates a new line)
    const message = `Namaste 🙏\n\nThis is a friendly reminder that the monthly fee of ₹${student.price} for ${student.name} is due on ${formattedDate}.\n\nKindly make the payment on time.\n\nThank you,\n${settings.libraryName || 'Management'}`;
    
    // 3. Encode the message so it's safe to put inside a URL
    const encodedMessage = encodeURIComponent(message);
    
    // 4. Clean the phone number and add '91' if it's a standard 10-digit Indian number
    let phone = student.phone.replace(/\D/g, ''); // Removes all non-numeric characters
    if (phone.length === 10) {
      phone = '91' + phone; 
    }
    
    // 5. Return the final clickable WhatsApp link
    return `https://wa.me/${phone}?text=${encodedMessage}`;
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-slate-900">Fee Reminders</h1>
        </div>
      </header>

      <div className="p-6 flex flex-col gap-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center gap-1 rounded-2xl bg-white p-3 shadow-sm border border-rose-50">
            <span className="text-2xl font-black text-rose-600">{stats.overdueCount}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Overdue</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-2xl bg-white p-3 shadow-sm border border-amber-50">
            <span className="text-2xl font-black text-amber-600">{stats.dueTodayCount}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Due Today</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-2xl bg-white p-3 shadow-sm border border-emerald-50">
            <span className="text-2xl font-black text-emerald-600">{stats.paidThisMonthCount}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Paid</span>
          </div>
        </div>

        {/* Pending Amount Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-indigo-600 p-5 text-white shadow-lg shadow-indigo-100">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-xl" />
          <div className="relative flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-100">Total Pending Fees</span>
              <span className="text-2xl font-black">₹{stats.totalPendingAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <IndianRupee className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search student or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border-none bg-white py-4 pl-12 pr-4 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {(['All', 'Due Today', 'Overdue', 'Paid'] as FilterType[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`whitespace-nowrap rounded-full px-5 py-2.5 text-xs font-bold transition-all ${
                  activeFilter === filter 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'bg-white text-slate-500 shadow-sm'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Student List */}
        <div className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {filteredStudents.map((student) => (
              <motion.div 
                key={student.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                      <Users className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{student.name}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Desk {student.deskNumber} • {student.phone}
                      </span>
                    </div>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    student.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600' :
                    student.paymentStatus === 'Overdue' ? 'bg-rose-50 text-rose-600' :
                    'bg-amber-50 text-amber-600'
                  }`}>
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
                    <span className="text-sm font-black text-indigo-600">₹{student.price}</span>
                  </div>
                </div>

                {student.paymentStatus !== 'Paid' && (
                  <a 
                    href={generateWhatsAppLink(student)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full rounded-2xl bg-emerald-600 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-emerald-100 transition-all active:scale-95"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Send Reminder
                  </a>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredStudents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-slate-100 p-4 text-slate-300">
                <Bell className="h-8 w-8" />
              </div>
              <p className="text-sm font-medium text-slate-400">No students found for this filter.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

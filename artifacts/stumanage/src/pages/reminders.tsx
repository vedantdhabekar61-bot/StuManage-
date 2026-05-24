import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, MessageCircle, Search, IndianRupee, Bell, Users, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudents } from '@/hooks/use-students';
import { Student } from '@/lib/types';
import { cn, isStudentOverdue } from '@/lib/utils';
import { WhatsAppReminderButton } from '@/components/whatsapp-reminder-button';
import { BulkReminderSheet } from '@/components/bulk-reminder-sheet';

type FilterType = 'All' | 'Overdue' | 'Paid';

export default function RemindersPage() {
  const [, navigate] = useLocation();
  const { students, isLoaded } = useStudents();
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isBulkOpen, setIsBulkOpen] = useState(false);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || s.phoneNumber.includes(searchQuery);
      let matchesFilter = true;
      if (activeFilter === 'Overdue') matchesFilter = isStudentOverdue(s) || s.paymentStatus === 'Pending';
      else if (activeFilter === 'Paid') matchesFilter = s.paymentStatus === 'Paid' && !isStudentOverdue(s);
      return matchesSearch && matchesFilter;
    }).sort((a, b) => {
      const aOverdue = isStudentOverdue(a); const bOverdue = isStudentOverdue(b);
      if (aOverdue && !bOverdue) return -1; if (!aOverdue && bOverdue) return 1;
      return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
    });
  }, [students, activeFilter, searchQuery]);

  const stats = useMemo(() => ({
    totalDue: students.filter(s => s.paymentStatus !== 'Paid' || isStudentOverdue(s)).reduce((acc, s) => acc + (Number(s.price) || 0), 0),
    overdueCount: students.filter(s => isStudentOverdue(s)).length,
    pendingCount: students.filter(s => s.paymentStatus === 'Pending').length,
  }), [students]);

  if (!isLoaded) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <main className="flex min-h-screen flex-col bg-background pb-24">
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur-md pb-4 pt-6 px-4 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="w-11 h-11 rounded-full bg-card shadow-soft flex items-center justify-center text-muted active:scale-95 transition-transform"><ArrowLeft className="h-5 w-5" /></button>
            <h1 className="text-[24px] font-extrabold tracking-tight text-foreground">Reminders</h1>
          </div>
          <button onClick={() => setIsBulkOpen(true)} className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2.5 rounded-2xl font-bold text-sm active:scale-95 transition-transform"><Send className="h-4 w-4" />Bulk Send</button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { icon: <IndianRupee className="h-5 w-5" />, label: 'Total Due', value: `₹${stats.totalDue.toLocaleString('en-IN')}`, color: 'bg-rose-50 text-rose-600' },
            { icon: <Bell className="h-5 w-5" />, label: 'Overdue', value: stats.overdueCount, color: 'bg-orange-50 text-orange-600' },
            { icon: <Users className="h-5 w-5" />, label: 'Pending', value: stats.pendingCount, color: 'bg-amber-50 text-amber-600' },
          ].map(item => (
            <div key={item.label} className="bg-card rounded-2xl p-3 shadow-soft text-center">
              <div className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center mx-auto mb-1`}>{item.icon}</div>
              <p className="text-[18px] font-black text-foreground">{item.value}</p>
              <p className="text-[10px] font-bold text-muted uppercase tracking-wider">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input type="text" placeholder="Search students..." className="w-full bg-card border-none shadow-soft rounded-full py-3 pl-11 pr-4 text-[14px] font-semibold placeholder:text-muted/50 focus:ring-2 focus:ring-primary focus:outline-none text-foreground" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>

        <div className="flex gap-2">
          {(['All', 'Overdue', 'Paid'] as FilterType[]).map(f => (
            <button key={f} onClick={() => setActiveFilter(f)} className={cn("px-4 py-2 rounded-full text-[13px] font-bold transition-all active:scale-95", activeFilter === f ? "bg-primary/10 text-primary" : "bg-transparent text-muted border border-border/50")}>{f}</button>
          ))}
        </div>
      </header>

      <div className="flex-1 px-4 py-3 space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredStudents.map(student => {
            const isOverdue = isStudentOverdue(student);
            const expiryDate = new Date(student.expiryDate);
            const today = new Date(); today.setHours(0, 0, 0, 0); expiryDate.setHours(0, 0, 0, 0);
            const daysLeft = Math.round((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return (
              <motion.div key={student.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card rounded-3xl p-5 shadow-soft border border-border/5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-extrabold text-foreground text-[17px]">{student.studentName}</p>
                    <p className="text-[12px] font-bold text-muted mt-0.5">Seat {student.deskNumber} • {student.shift}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-foreground text-[17px]">₹{student.price}</p>
                    <p className={cn("text-[12px] font-black mt-0.5", isOverdue ? "text-rose-600" : student.paymentStatus === 'Pending' ? "text-amber-500" : "text-primary")}>
                      {isOverdue ? `${Math.abs(daysLeft)}d overdue` : student.paymentStatus === 'Pending' ? 'Unpaid' : `Paid • ${daysLeft}d left`}
                    </p>
                  </div>
                </div>
                {(student.paymentStatus !== 'Paid' || isOverdue) && (
                  <WhatsAppReminderButton student={student} showText={true} className="w-full h-12 rounded-2xl bg-[#25D366] text-white shadow-lg shadow-[#25D366]/10 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest active:scale-[0.98] transition-all" />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filteredStudents.length === 0 && <div className="flex flex-col items-center justify-center py-20 text-center opacity-40"><MessageCircle className="h-12 w-12 mb-4" /><p className="font-bold">No students found</p></div>}
      </div>
      <BulkReminderSheet students={students} isOpen={isBulkOpen} onClose={() => setIsBulkOpen(false)} />
    </main>
  );
}

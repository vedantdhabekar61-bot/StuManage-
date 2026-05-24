import { useState, useMemo, useEffect } from 'react';
import { Search, PlusCircle, Users, Edit2, X, CheckCircle2, User, Phone, Armchair, Clock, ArrowLeft, AlertCircle } from 'lucide-react';
import { useLocation } from 'wouter';
import { StatusTag } from '@/components/status-tag';
import { Student, Shift } from '@/lib/types';
import { useStudents } from '@/hooks/use-students';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { cn, isStudentOverdue, isValidPhone, toLocalDateString } from '@/lib/utils';
import { WhatsAppReminderButton } from '@/components/whatsapp-reminder-button';

export default function StudentsPage() {
  const [, navigate] = useLocation();
  const { students, isLoaded, updateStudent, deleteStudent, refreshStudents } = useStudents();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Paid' | 'Pending' | 'Overdue'>('All');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { scrollY } = useScroll();
  const refreshOpacity = useTransform(scrollY, [-80, 0], [1, 0]);
  const refreshScale = useTransform(scrollY, [-80, 0], [1, 0.5]);

  useEffect(() => {
    const handleScroll = async () => {
      if (window.scrollY < -80 && !isRefreshing) { setIsRefreshing(true); await refreshStudents(); setIsRefreshing(false); }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isRefreshing, refreshStudents]);

  const filteredStudents = useMemo(() => students.filter(s => {
    const matchesSearch = s.studentName.toLowerCase().includes(search.toLowerCase()) || s.phoneNumber.includes(search) || s.deskNumber.toString().includes(search);
    let matchesFilter = filter === 'All' ? true : filter === 'Overdue' ? isStudentOverdue(s) : s.paymentStatus === filter;
    return matchesSearch && matchesFilter;
  }).sort((a, b) => a.studentName.localeCompare(b.studentName)), [students, search, filter]);

  if (!isLoaded) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <main className="flex min-h-screen flex-col bg-background pb-24">
      <motion.div style={{ opacity: refreshOpacity, scale: refreshScale }} className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <div className="bg-primary text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          {isRefreshing ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Clock className="h-4 w-4" />}
          <span className="text-[10px] font-bold uppercase tracking-widest">{isRefreshing ? 'Updating...' : 'Pull to refresh'}</span>
        </div>
      </motion.div>

      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur-md pb-3 pt-6 px-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="w-11 h-11 rounded-full bg-card shadow-soft flex items-center justify-center text-muted active:scale-95 transition-transform"><ArrowLeft className="h-5 w-5" /></button>
            <h1 className="text-[24px] font-extrabold tracking-tight text-foreground">Student Roster</h1>
          </div>
          <button onClick={() => navigate('/add')} className="w-11 h-11 rounded-full bg-card shadow-soft flex items-center justify-center text-primary active:scale-95 transition-transform"><PlusCircle className="h-6 w-6" /></button>
        </div>
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search className="h-5 w-5 text-muted" /></div>
          <input type="text" className="w-full bg-card border-none shadow-soft rounded-full py-3.5 pl-11 pr-4 text-[15px] font-semibold placeholder:text-muted/50 focus:ring-2 focus:ring-primary focus:outline-none transition-shadow text-foreground" placeholder="Search by name or seat..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex overflow-x-auto gap-2 pb-1 -mx-4 px-4">
          {(['All', 'Paid', 'Pending', 'Overdue'] as const).map(f => {
            const count = f === 'Overdue' ? students.filter(s => isStudentOverdue(s)).length : 0;
            return (
              <button key={f} onClick={() => setFilter(f)} className={cn("whitespace-nowrap px-5 py-2 rounded-full text-[13px] font-bold tracking-wide transition-all active:scale-95 flex-shrink-0", filter === f ? "bg-primary/10 text-primary" : "bg-transparent text-muted border border-border/50")}>
                {f}{count > 0 && <span className="ml-1.5 bg-accent/10 text-accent px-1.5 py-0.5 rounded-full text-[10px]">{count}</span>}
              </button>
            );
          })}
        </div>
      </header>

      <div className="flex-1 px-4 py-2 space-y-3 overflow-x-hidden mt-2">
        <AnimatePresence mode="popLayout">
          {filteredStudents.map(student => (
            <motion.div key={student.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative overflow-hidden rounded-2xl group active:scale-[0.99] transition-transform">
              <div className="absolute inset-0 bg-primary/5 flex items-center justify-end px-4 gap-3">
                {(student.paymentStatus !== 'Paid' || isStudentOverdue(student)) && (
                  <button onClick={() => { const now = new Date(); const cur = new Date(student.expiryDate); const base = cur > now ? cur : now; const next = new Date(base); const exp = (next.getMonth() + 1) % 12; next.setMonth(next.getMonth() + 1); if (next.getMonth() !== exp) next.setDate(0); updateStudent(student.id, { paymentStatus: 'Paid', expiryDate: toLocalDateString(next), lastPaymentDate: toLocalDateString(now) }); }} className="h-11 w-11 rounded-full bg-primary text-white shadow-lg flex items-center justify-center active:scale-90 transition-transform"><CheckCircle2 className="h-5 w-5" /></button>
                )}
                <WhatsAppReminderButton student={student} showText={false} className="h-11 w-11 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform" />
                <button onClick={() => setEditingStudent(student)} className="h-11 w-11 rounded-full bg-white text-muted shadow-lg shadow-black/5 flex items-center justify-center active:scale-90 transition-transform"><Edit2 className="h-4 w-4" /></button>
              </div>
              <motion.div drag="x" dragConstraints={{ left: -180, right: 0 }} dragElastic={0.1} onClick={() => setEditingStudent(student)} className="relative z-10 bg-card min-h-[80px] w-full rounded-2xl shadow-soft p-4 flex items-center justify-between active:bg-muted/5 transition-colors cursor-pointer border border-border/10">
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-full flex items-center justify-center font-bold text-[16px] shadow-sm", student.id.charCodeAt(0) % 4 === 0 ? "bg-teal-100 text-primary" : student.id.charCodeAt(0) % 4 === 1 ? "bg-orange-100 text-orange-600" : student.id.charCodeAt(0) % 4 === 2 ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600")}>
                    {student.studentName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="text-[16px] font-extrabold text-foreground leading-tight">{student.studentName}</h3>
                    <p className="text-[13px] font-semibold text-muted mt-0.5">Seat {student.deskNumber} • {student.shift}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <StatusTag status={isStudentOverdue(student) ? 'Overdue' : student.paymentStatus} />
                    <button onClick={e => { e.stopPropagation(); setDeletingStudent(student); }} className="h-11 w-11 -mr-3 flex items-center justify-center active:scale-95 transition-transform"><div className="h-6 w-6 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center"><X className="h-4 w-4" /></div></button>
                  </div>
                  <span className="text-[11px] font-bold text-muted">₹{student.price}/mo</span>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredStudents.length === 0 && <div className="flex flex-col items-center justify-center py-20 text-center opacity-40"><Users className="h-12 w-12 mb-4" /><p className="font-bold">No students found</p></div>}
        <div className="py-6 flex flex-col items-center justify-center text-[#78716C] opacity-50"><Users className="h-8 w-8 mb-2" /><p className="text-[13px] font-bold">End of active roster</p></div>
      </div>

      <AnimatePresence>
        {editingStudent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-6">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-md overflow-hidden rounded-[32px] bg-card shadow-2xl">
              <div className="flex items-center justify-between p-6 pb-2">
                <h3 className="text-[20px] font-extrabold text-foreground">Edit Student</h3>
                <button onClick={() => { setEditingStudent(null); setEditError(null); }} className="h-11 w-11 rounded-full bg-background flex items-center justify-center text-muted active:scale-95 transition-transform"><X className="h-6 w-6" /></button>
              </div>
              <form onSubmit={async e => {
                e.preventDefault();
                if (!editingStudent) return;
                try {
                  setEditError(null);
                  if (!isValidPhone(editingStudent.phoneNumber)) { setEditError('Please enter a valid 10-digit phone number.'); return; }
                  await updateStudent(editingStudent.id, editingStudent);
                  setEditingStudent(null);
                } catch (err: any) { setEditError(err.message || 'Failed to update student'); }
              }} className="p-6 pt-2 space-y-4">
                {editError && <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-xs font-bold flex items-center gap-2"><AlertCircle className="h-4 w-4" />{editError}</div>}
                <div className="space-y-3">
                  <div className="relative"><User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted/50" /><input required type="text" placeholder="Full Name" className="w-full bg-background border-none rounded-2xl py-3.5 pl-12 pr-4 text-[15px] font-semibold focus:ring-2 focus:ring-primary focus:outline-none text-foreground placeholder:text-muted/50" value={editingStudent.studentName} onChange={e => setEditingStudent({ ...editingStudent, studentName: e.target.value })} /></div>
                  <div className="relative"><Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted/50" /><input required type="tel" inputMode="numeric" placeholder="Phone Number" className="w-full bg-background border-none rounded-2xl py-3.5 pl-12 pr-4 text-[15px] font-semibold focus:ring-2 focus:ring-primary focus:outline-none text-foreground placeholder:text-muted/50" value={editingStudent.phoneNumber} onChange={e => setEditingStudent({ ...editingStudent, phoneNumber: e.target.value })} /></div>
                  <div className="relative"><Armchair className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted/50" /><input required type="number" placeholder="Desk No." className="w-full bg-background border-none rounded-2xl py-3.5 pl-12 pr-4 text-[15px] font-semibold focus:ring-2 focus:ring-primary focus:outline-none text-foreground placeholder:text-muted/50" value={editingStudent.deskNumber} onChange={e => setEditingStudent({ ...editingStudent, deskNumber: parseInt(e.target.value) || 0 })} /></div>
                  <select className="w-full bg-background border-none rounded-2xl py-3.5 px-4 text-[15px] font-semibold focus:ring-2 focus:ring-primary focus:outline-none text-foreground" value={editingStudent.shift} onChange={e => setEditingStudent({ ...editingStudent, shift: e.target.value as Shift })}>
                    {(['Morning', 'Afternoon', 'Evening', 'Full Day'] as Shift[]).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input type="number" placeholder="Price" className="w-full bg-background border-none rounded-2xl py-3.5 px-4 text-[15px] font-semibold focus:ring-2 focus:ring-primary focus:outline-none text-foreground" value={editingStudent.price} onChange={e => setEditingStudent({ ...editingStudent, price: parseInt(e.target.value) || 0 })} />
                  <input type="date" className="w-full bg-background border-none rounded-2xl py-3.5 px-4 text-[15px] font-semibold focus:ring-2 focus:ring-primary focus:outline-none text-foreground" value={editingStudent.expiryDate} onChange={e => setEditingStudent({ ...editingStudent, expiryDate: e.target.value })} />
                </div>
                <button type="submit" className="w-full rounded-2xl bg-primary py-4 text-[15px] font-bold uppercase tracking-widest text-white shadow-lg shadow-primary/20 active:scale-95 transition-transform">Save Changes</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deletingStudent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-6">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-sm rounded-[2.5rem] bg-card p-8 shadow-2xl text-center">
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4"><X className="h-8 w-8" /></div>
              <h3 className="text-xl font-black text-foreground mb-2">Delete Student?</h3>
              <p className="text-sm font-semibold text-muted mb-6">Remove <strong>{deletingStudent.studentName}</strong> from the roster?</p>
              <div className="flex gap-3">
                <button onClick={() => setDeletingStudent(null)} className="flex-1 rounded-2xl bg-background py-4 text-[13px] font-black uppercase tracking-widest text-muted active:scale-95 transition-transform">Cancel</button>
                <button onClick={async () => { await deleteStudent(deletingStudent.id); setDeletingStudent(null); }} className="flex-1 rounded-2xl bg-rose-600 py-4 text-[13px] font-black uppercase tracking-widest text-white shadow-lg shadow-rose-200 active:scale-95 transition-transform">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

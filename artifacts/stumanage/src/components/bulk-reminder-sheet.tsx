import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, CheckCircle2 } from 'lucide-react';
import { Student } from '@/lib/types';
import { WhatsAppReminderButton } from './whatsapp-reminder-button';

interface BulkReminderSheetProps { students: Student[]; isOpen: boolean; onClose: () => void; }

export function BulkReminderSheet({ students, isOpen, onClose }: BulkReminderSheetProps) {
  const dueStudents = useMemo(() => students.filter(s => s.paymentStatus !== 'Paid').sort((a, b) => {
    if (a.paymentStatus === 'Overdue' && b.paymentStatus !== 'Overdue') return -1;
    if (a.paymentStatus !== 'Overdue' && b.paymentStatus === 'Overdue') return 1;
    return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
  }), [students]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm" />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[101] flex max-h-[85vh] flex-col rounded-t-[2.5rem] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-50 p-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Bulk Reminders</h3>
                <p className="text-xs font-medium text-slate-400">{dueStudents.length} students pending payment</p>
              </div>
              <button onClick={onClose} className="rounded-full bg-slate-50 p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex flex-col gap-4">
                {dueStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between rounded-2xl border border-slate-50 bg-slate-50/50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm"><Users className="h-5 w-5" /></div>
                      <div>
                        <span className="text-sm font-bold text-slate-900">{student.studentName}</span>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">₹{student.price} • Due {new Date(student.expiryDate).toLocaleDateString('en-GB')}</span>
                      </div>
                    </div>
                    <WhatsAppReminderButton student={student} showText={false} className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#25D366] text-white shadow-lg shadow-[#25D366]/20 transition-all active:scale-95" />
                  </div>
                ))}
                {dueStudents.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-4 rounded-full bg-emerald-50 p-4 text-emerald-600"><CheckCircle2 className="h-8 w-8" /></div>
                    <p className="text-sm font-medium text-slate-500">All students have paid their fees!</p>
                  </div>
                )}
              </div>
            </div>
            <div className="border-t border-slate-50 p-6">
              <button onClick={onClose} className="w-full rounded-2xl bg-slate-900 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-lg transition-all active:scale-95">Done</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Filter, MessageCircle, MoreVertical, Phone, Users, Trash2, Edit2, X, CheckCircle2, User, Armchair, Clock, Calendar, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { StatusTag } from '@/components/status-tag';
import { Student, Shift } from '@/lib/types';
import { useStudents } from '@/hooks/use-students';
import { useSettings } from '@/hooks/use-settings';
import { motion, AnimatePresence } from 'motion/react';
import { useMemo } from 'react';
import { formatWhatsAppMessage, openWhatsApp, getWhatsAppUrl } from '@/lib/utils';
import { WhatsAppReminderButton } from '@/components/whatsapp-reminder-button';

export default function StudentsPage() {
  const router = useRouter();
  const { students, isLoaded, updateStudent, deleteStudent } = useStudents();
  const { settings } = useSettings();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Paid' | 'Pending' | 'Overdue'>('All');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.phone.includes(search);
      const matchesFilter = filter === 'All' || s.paymentStatus === filter;
      return matchesSearch && matchesFilter;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [students, search, filter]);

  const sendWhatsApp = (student: Student) => {
    const message = formatWhatsAppMessage(settings.messageTemplate, student, settings.libraryName);
    openWhatsApp(student, message);
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
      <header className="flex flex-col gap-6 px-6 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm text-slate-500 transition-all active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-slate-900">Student Roster</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search students..." 
            className="w-full rounded-2xl border-none bg-white py-4 pl-12 pr-4 text-sm font-medium shadow-sm focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {['All', 'Paid', 'Overdue'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={cn(
                "rounded-full px-6 py-2 text-xs font-bold transition-all active:scale-95",
                filter === f 
                  ? "bg-teal-500 text-white shadow-lg shadow-teal-100" 
                  : "bg-white text-slate-500 shadow-sm"
              )}
            >
              {f}
            </button>
          ))}
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
              className="soft-card p-4 flex items-center justify-between transition-all hover:scale-[1.01]"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "h-14 w-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-sm",
                  student.paymentStatus === 'Paid' ? "bg-teal-50 text-teal-600" : "bg-rose-50 text-rose-600"
                )}>
                  {student.name.charAt(0)}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-slate-900">{student.name}</span>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5">Desk {student.deskNumber}</span>
                    <span>•</span>
                    <span>₹{student.price}/mo</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-3">
                <div className={cn(
                  "status-pill",
                  student.paymentStatus === 'Paid' ? "bg-teal-100 text-teal-700" : "bg-rose-100 text-rose-700"
                )}>
                  {student.paymentStatus}
                </div>
                <div className="flex items-center gap-2">
                  <WhatsAppReminderButton
                    student={student}
                    showText={false}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-500 text-white shadow-lg shadow-teal-100 transition-all active:scale-95"
                  />
                  <button 
                    onClick={() => setEditingStudent(student)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-teal-50 hover:text-teal-600 active:scale-95"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Edit Modal */}
        <AnimatePresence>
          {editingStudent && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-slate-50 p-6">
                  <h3 className="text-lg font-bold text-slate-900">Edit Student</h3>
                  <button 
                    onClick={() => setEditingStudent(null)}
                    className="rounded-full bg-slate-50 p-2 text-slate-400 hover:bg-slate-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (editingStudent) {
                      updateStudent(editingStudent.id, editingStudent);
                      setEditingStudent(null);
                    }
                  }}
                  className="flex flex-col gap-4 p-6"
                >
                  <div className="flex flex-col gap-3">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input 
                        required
                        type="text" 
                        placeholder="Full Name" 
                        className="w-full rounded-2xl border border-slate-100 bg-white py-3 pl-10 pr-4 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
                        value={editingStudent.name}
                        onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input 
                        required
                        type="tel" 
                        placeholder="Phone Number" 
                        className="w-full rounded-2xl border border-slate-100 bg-white py-3 pl-10 pr-4 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
                        value={editingStudent.phone}
                        onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <Armchair className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input 
                          required
                          type="number" 
                          placeholder="Desk No." 
                          className="w-full rounded-2xl border border-slate-100 bg-white py-3 pl-10 pr-4 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
                          value={editingStudent.deskNumber}
                          onChange={(e) => setEditingStudent({ ...editingStudent, deskNumber: parseInt(e.target.value) })}
                        />
                      </div>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <select 
                          className="w-full appearance-none rounded-2xl border border-slate-100 bg-white py-3 pl-10 pr-4 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
                          value={editingStudent.shift}
                          onChange={(e) => setEditingStudent({ ...editingStudent, shift: e.target.value as Shift })}
                        >
                          <option value="Morning">Morning</option>
                          <option value="Evening">Evening</option>
                          <option value="Full Day">Full Day</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-indigo-200 transition-all active:scale-95"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Save Changes</span>
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deletingStudent && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-sm overflow-hidden rounded-3xl bg-white p-6 shadow-2xl"
              >
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="rounded-full bg-rose-50 p-4 text-rose-600">
                    <Trash2 className="h-8 w-8" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-bold text-slate-900">Remove Student?</h3>
                    <p className="text-sm text-slate-500">
                      Are you sure you want to remove <span className="font-bold text-slate-700">{deletingStudent.name}</span>? This action cannot be undone.
                    </p>
                  </div>
                  <div className="mt-2 grid w-full grid-cols-2 gap-3">
                    <button 
                      onClick={() => setDeletingStudent(null)}
                      className="rounded-2xl bg-slate-50 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => {
                        deleteStudent(deletingStudent.id);
                        setDeletingStudent(null);
                      }}
                      className="rounded-2xl bg-rose-600 py-3 text-sm font-bold text-white shadow-lg shadow-rose-200 transition-all active:scale-95"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {filteredStudents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-slate-50 p-4 text-slate-300">
              <Users className="h-8 w-8" />
            </div>
            <p className="text-slate-500">No students found matching your criteria.</p>
          </div>
        )}
      </div>
    </main>
  );
}

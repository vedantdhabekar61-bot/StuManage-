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
    <main className="flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-4">
        <button 
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Student Roster</h1>
        
        {/* Search & Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search name or phone..." 
              className="w-full rounded-2xl border border-slate-100 bg-white py-2 pl-10 pr-4 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="rounded-2xl border border-slate-100 bg-white p-2 text-slate-400 shadow-sm transition-colors hover:text-indigo-600">
            <Filter className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['All', 'Paid', 'Pending', 'Overdue'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wider transition-all ${
                filter === f 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                  : 'bg-white text-slate-400 border border-slate-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      {/* Student List */}
      <div className="flex flex-col gap-4 min-h-[200px]">
        <AnimatePresence mode="popLayout">
          {filteredStudents.map((student) => (
            <motion.div 
              key={student.id} 
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
              className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md"
            >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg">
                  {student.name.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900">{student.name}</span>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Phone className="h-3 w-3" />
                    <span>{student.phone}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusTag status={student.paymentStatus} />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Desk {student.deskNumber} • {student.shift}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-50 pt-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fees Due Date</span>
                <span className="text-xs font-semibold text-slate-700">{new Date(student.expiryDate).toLocaleDateString('en-GB')}</span>
              </div>
              <div className="flex items-center gap-2">
                <a 
                  href={getWhatsAppUrl(student, formatWhatsAppMessage(settings.messageTemplate, student, settings.libraryName))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100 active:scale-95"
                >
                  <MessageCircle className="h-5 w-5" />
                </a>
                <div className="relative">
                  <button 
                    onClick={() => setActiveMenu(activeMenu === student.id ? null : student.id)}
                    className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors active:scale-95 ${
                      activeMenu === student.id ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>

                  <AnimatePresence>
                    {activeMenu === student.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setActiveMenu(null)}
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          className="absolute right-0 top-10 z-20 w-36 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl"
                        >
                          <button 
                            onClick={() => {
                              setEditingStudent(student);
                              setActiveMenu(null);
                            }}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                          >
                            <Edit2 className="h-4 w-4" />
                            <span>Edit Profile</span>
                          </button>
                          <button 
                            onClick={() => {
                              setDeletingStudent(student);
                              setActiveMenu(null);
                            }}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Remove</span>
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
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

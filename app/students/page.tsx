'use client';

import { useState, useMemo } from 'react';
import { Search, PlusCircle, Users, Edit2, Trash2, X, CheckCircle2, User, Phone, Armchair, Clock, ArrowLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { StatusTag } from '@/components/status-tag';
import { Student, Shift } from '@/lib/types';
import { useStudents } from '@/hooks/use-students';
import { useSettings } from '@/hooks/use-settings';
import { motion, AnimatePresence } from 'motion/react';
import { formatWhatsAppMessage, openWhatsApp, cn, isStudentOverdue } from '@/lib/utils';
import { WhatsAppReminderButton } from '@/components/whatsapp-reminder-button';

export default function StudentsPage() {
  const router = useRouter();
  const { students, isLoaded, updateStudent, deleteStudent } = useStudents();
  const { settings } = useSettings();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Paid' | 'Pending' | 'Overdue'>('All');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      // Search matching logic
      const matchesSearch = s.studentName.toLowerCase().includes(search.toLowerCase()) || s.phoneNumber.includes(search);
      
      // Filter matching logic updated with isStudentOverdue
      let matchesFilter = false;
      if (filter === 'All') {
        matchesFilter = true;
      } else if (filter === 'Overdue') {
        matchesFilter = isStudentOverdue(s);
      } else {
        matchesFilter = s.paymentStatus === filter;
      }

      return matchesSearch && matchesFilter;
    }).sort((a, b) => a.studentName.localeCompare(b.studentName));
  }, [students, search, filter]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#FDFBF7] pb-24">
      {/* Sticky Header Area */}
      <header className="sticky top-0 z-20 bg-[#FDFBF7]/90 backdrop-blur-md pb-3 pt-6 px-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-white shadow-[0_4px_14px_rgba(28,25,23,0.05)] flex items-center justify-center text-[#78716C] active:scale-95 transition-transform"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-[24px] font-extrabold tracking-tight text-[#1C1917]">Student Roster</h1>
          </div>
          <button 
            onClick={() => router.push('/add')}
            className="w-10 h-10 rounded-full bg-white shadow-[0_4px_14px_rgba(28,25,23,0.05)] flex items-center justify-center text-primary active:scale-95 transition-transform"
          >
            <PlusCircle className="h-6 w-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-[#78716C]" />
          </div>
          <input 
            type="text"
            className="w-full bg-white border-none shadow-[0_4px_14px_rgba(28,25,23,0.05)] rounded-full py-3.5 pl-11 pr-4 text-[15px] font-semibold placeholder:text-[#78716C]/50 focus:ring-2 focus:ring-primary focus:outline-none transition-shadow"
            placeholder="Search by name or seat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filter Chips */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1 -mx-4 px-4">
          {(['All', 'Paid', 'Pending', 'Overdue'] as const).map((f) => {
            // Updated counter logic to match the filter function
            const count = f === 'Overdue' ? students.filter(s => isStudentOverdue(s)).length : 0;
            return (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={cn(
                  "whitespace-nowrap px-5 py-2 rounded-full text-[13px] font-bold tracking-wide transition-all active:scale-95 flex-shrink-0",
                  filter === f 
                    ? "bg-primary/10 text-primary" 
                    : "bg-transparent text-[#78716C] border border-[#dee4e1]/30"
                )}
              >
                {f}
                {count > 0 && (
                  <span className="ml-1.5 bg-[#F59E0B]/10 text-[#F59E0B] px-1.5 py-0.5 rounded-full text-[10px]">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content List */}
      <div className="flex-1 px-4 py-2 space-y-3 overflow-x-hidden mt-2">
        <AnimatePresence mode="popLayout">
          {filteredStudents.map((student) => (
            <motion.div
              key={student.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative group"
            >
              <div 
                onClick={() => setEditingStudent(student)}
                className="relative z-10 bg-white min-h-[80px] w-full rounded-2xl shadow-[0_4px_14px_rgba(28,25,23,0.05)] p-4 flex items-center justify-between active:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center font-bold text-[16px] shadow-sm",
                    student.id.charCodeAt(0) % 4 === 0 ? "bg-teal-100 text-primary" : 
                    student.id.charCodeAt(0) % 4 === 1 ? "bg-orange-100 text-orange-600" : 
                    student.id.charCodeAt(0) % 4 === 2 ? "bg-blue-100 text-blue-600" :
                    "bg-purple-100 text-purple-600"
                  )}>
                    {student.studentName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="text-[16px] font-extrabold text-[#1C1917] leading-tight">{student.studentName}</h3>
                    <p className="text-[13px] font-semibold text-[#78716C] mt-0.5">
                      Seat {student.deskNumber} • {student.shift}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <StatusTag status={student.paymentStatus} />
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingStudent(student);
                      }}
                      className="h-6 w-6 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center active:scale-95 transition-transform"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-[11px] font-bold text-[#78716C]">₹{student.price}/mo</span>
                </div>
              </div>

              {/* Quick Actions (Visible on hover or swipe - simplified for now) */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none group-hover:pointer-events-auto">
                {student.paymentStatus !== 'Paid' && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const now = new Date();
                      const currentExpiry = new Date(student.expiryDate);
                      const baseDate = currentExpiry > now ? currentExpiry : now;
                      const newExpiry = new Date(baseDate);
                      newExpiry.setMonth(newExpiry.getMonth() + 1);
                      updateStudent(student.id, {
                        paymentStatus: 'Paid',
                        expiryDate: newExpiry.toISOString().split('T')[0],
                        lastPaymentDate: now.toISOString().split('T')[0],
                      });
                    }}
                    className="h-8 w-8 rounded-full bg-primary text-white shadow-md flex items-center justify-center active:scale-95 transition-transform"
                    title="Mark as Paid"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                )}
                <WhatsAppReminderButton
                  student={student}
                  showText={false}
                  className="h-8 w-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
                />
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingStudent(student);
                  }}
                  className="h-8 w-8 rounded-full bg-white shadow-md flex items-center justify-center text-[#78716C] active:scale-95 transition-transform"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredStudents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <Users className="h-12 w-12 mb-4" />
            <p className="font-bold">No students found</p>
          </div>
        )}

        {/* End of List Indicator */}
        <div className="py-6 flex flex-col items-center justify-center text-[#78716C] opacity-50">
          <Users className="h-8 w-8 mb-2" />
          <p className="text-[13px] font-bold">End of active roster</p>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingStudent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1C1917]/40 backdrop-blur-sm p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md overflow-hidden rounded-[32px] bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 pb-2">
                <h3 className="text-[20px] font-extrabold text-[#1C1917]">Edit Student</h3>
                <button 
                  onClick={() => {
                    setEditingStudent(null);
                    setEditError(null);
                  }}
                  className="rounded-full bg-[#FDFBF7] p-2 text-[#78716C] hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (editingStudent) {
                    try {
                      setEditError(null);
                      await updateStudent(editingStudent.id, editingStudent);
                      setEditingStudent(null);
                    } catch (err: any) {
                      setEditError(err.message || 'Failed to update student');
                    }
                  }
                }}
                className="p-6 pt-2 space-y-4"
              >
                {editError && (
                  <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {editError}
                  </div>
                )}
                <div className="space-y-3">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#78716C]/50" />
                    <input 
                      required
                      type="text" 
                      placeholder="Full Name" 
                      className="w-full bg-[#FDFBF7] border-none rounded-2xl py-3.5 pl-12 pr-4 text-[15px] font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
                      value={editingStudent.studentName}
                      onChange={(e) => setEditingStudent({ ...editingStudent, studentName: e.target.value })}
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#78716C]/50" />
                    <input 
                      required
                      type="tel" 
                      placeholder="Phone Number" 
                      className="w-full bg-[#FDFBF7] border-none rounded-2xl py-3.5 pl-12 pr-4 text-[15px] font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
                      value={editingStudent.phoneNumber}
                      onChange={(e) => setEditingStudent({ ...editingStudent, phoneNumber: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <Armchair className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#78716C]/50" />
                      <input 
                        required
                        type="number" 
                        placeholder="Seat" 
                        className="w-full bg-[#FDFBF7] border-none rounded-2xl py-3.5 pl-12 pr-4 text-[15px] font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
                        value={editingStudent.deskNumber}
                        onChange={(e) => setEditingStudent({ ...editingStudent, deskNumber: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#78716C]/50" />
                      <select 
                        className="w-full bg-[#FDFBF7] border-none rounded-2xl py-3.5 pl-12 pr-4 text-[15px] font-semibold focus:ring-2 focus:ring-primary focus:outline-none appearance-none"
                        value={editingStudent.shift}
                        onChange={(e) => setEditingStudent({ ...editingStudent, shift: e.target.value as Shift })}
                      >
                        <option value="Morning">Morning</option>
                        <option value="Afternoon">Afternoon</option>
                        <option value="Evening">Evening</option>
                        <option value="Full Day">Full Day</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Dynamic Occupancy Check */}
                  <div className="px-1">
                    {(() => {
                      const deskNum = editingStudent.deskNumber;
                      const occupiedBy = students.find(s => 
                        s.id !== editingStudent.id &&
                        s.deskNumber === deskNum && 
                        (s.shift === editingStudent.shift || s.shift === 'Full Day' || editingStudent.shift === 'Full Day')
                      );
                      
                      if (occupiedBy) {
                        return (
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-3 w-3 text-rose-500" />
                            <span className="text-[11px] font-medium text-rose-500">
                              Desk {deskNum} is taken by {occupiedBy.studentName}
                            </span>
                          </div>
                        );
                      }
                      return (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                          <span className="text-[11px] font-medium text-primary">Desk {deskNum} is available</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setDeletingStudent(editingStudent)}
                    className="flex-1 bg-rose-50 text-rose-600 py-4 rounded-2xl text-[15px] font-bold active:scale-95 transition-transform"
                  >
                    Delete
                  </button>
                  <button 
                    type="submit" 
                    className="flex-[2] bg-primary text-white py-4 rounded-2xl text-[15px] font-bold shadow-lg shadow-primary/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingStudent && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#1C1917]/40 backdrop-blur-sm p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm overflow-hidden rounded-[32px] bg-white p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8" />
              </div>
              <h3 className="text-[20px] font-extrabold text-[#1C1917] mb-2">Delete Student?</h3>
              <p className="text-[#78716C] text-[15px] font-semibold mb-6">
                Are you sure you want to remove <span className="text-[#1C1917] font-bold">{deletingStudent.studentName}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeletingStudent(null)}
                  className="flex-1 bg-[#FDFBF7] text-[#78716C] py-4 rounded-2xl text-[15px] font-bold active:scale-95 transition-transform"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    deleteStudent(deletingStudent.id);
                    setDeletingStudent(null);
                    setEditingStudent(null);
                  }}
                  className="flex-1 bg-rose-600 text-white py-4 rounded-2xl text-[15px] font-bold shadow-lg shadow-rose-200 active:scale-95 transition-transform"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

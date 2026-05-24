import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Student } from '@/lib/types';
import { useAuth } from './use-auth';

interface StudentsContextType {
  students: Student[];
  addStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  updateStudent: (id: string, student: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  isLoaded: boolean;
  refreshStudents: () => Promise<void>;
}

const StudentsContext = createContext<StudentsContextType | undefined>(undefined);

export function StudentsProvider({ children }: { children: ReactNode }) {
  const { supabaseUser } = useAuth();
  const [students, setStudents] = useState<Student[]>(() => {
    if (typeof window !== 'undefined') {
      const lastUid = localStorage.getItem('last_auth_uid');
      if (lastUid) {
        const cached = localStorage.getItem(`students_${lastUid}`);
        if (cached) { try { return JSON.parse(cached); } catch (e) { console.error('Failed to parse cached students', e); } }
      }
    }
    return [];
  });
  const [isLoaded, setIsLoaded] = useState(() => {
    if (typeof window !== 'undefined') {
      const lastUid = localStorage.getItem('last_auth_uid');
      if (lastUid && localStorage.getItem(`students_${lastUid}`)) return true;
    }
    return false;
  });

  const fetchStudents = useCallback(async () => {
    if (!supabaseUser) { setStudents([]); setIsLoaded(true); return; }
    const cached = localStorage.getItem(`students_${supabaseUser.id}`);
    if (cached) { try { setStudents(JSON.parse(cached)); setIsLoaded(true); } catch (e) { console.error('Failed to parse cached students', e); } }
    const { data, error } = await supabase.from('students').select('*').eq('owner_id', supabaseUser.id).order('created_at', { ascending: false });
    if (error) { console.error('Error fetching students:', error.message); }
    else if (data) {
      const formatted: Student[] = data.map((s: any) => ({
        id: s.id, studentName: s.student_name, phoneNumber: s.phone_number,
        deskNumber: s.desk_number, shift: s.shift, plan: s.plan, price: s.price,
        joinDate: s.join_date, expiryDate: s.expiry_date, paymentStatus: s.payment_status,
        paymentMethod: s.payment_method, lastPaymentDate: s.last_payment_date
      }));
      setStudents(formatted);
      localStorage.setItem(`students_${supabaseUser.id}`, JSON.stringify(formatted));
    }
    setIsLoaded(true);
  }, [supabaseUser]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const addStudent = async (student: Omit<Student, 'id'>) => {
    if (!supabaseUser) return;
    const tempId = crypto.randomUUID();
    const newStudent: Student = { ...student, id: tempId };
    const previousStudents = [...students];
    const updatedStudents = [newStudent, ...students];
    setStudents(updatedStudents);
    localStorage.setItem(`students_${supabaseUser.id}`, JSON.stringify(updatedStudents));
    const { data, error } = await supabase.from('students').insert([{
      owner_id: supabaseUser.id, student_name: student.studentName, phone_number: student.phoneNumber,
      desk_number: student.deskNumber, shift: student.shift, plan: student.plan, price: student.price,
      join_date: student.joinDate, expiry_date: student.expiryDate, payment_status: student.paymentStatus,
      payment_method: student.paymentMethod, last_payment_date: student.lastPaymentDate
    }]).select().single();
    if (error) { console.error('Error adding student:', error.message); setStudents(previousStudents); localStorage.setItem(`students_${supabaseUser.id}`, JSON.stringify(previousStudents)); throw error; }
    if (data) {
      const realStudent: Student = {
        id: data.id, studentName: data.student_name, phoneNumber: data.phone_number,
        deskNumber: data.desk_number, shift: data.shift, plan: data.plan, price: data.price,
        joinDate: data.join_date, expiryDate: data.expiry_date, paymentStatus: data.payment_status,
        paymentMethod: data.payment_method, lastPaymentDate: data.last_payment_date
      };
      const final = [realStudent, ...previousStudents];
      setStudents(final);
      localStorage.setItem(`students_${supabaseUser.id}`, JSON.stringify(final));
    }
  };

  const updateStudent = async (id: string, student: Partial<Student>) => {
    if (!supabaseUser) return;
    const previousStudents = [...students];
    setStudents(students.map(s => s.id === id ? { ...s, ...student } : s));
    localStorage.setItem(`students_${supabaseUser.id}`, JSON.stringify(students.map(s => s.id === id ? { ...s, ...student } : s)));
    const updateData: any = {};
    if (student.studentName !== undefined) updateData.student_name = student.studentName;
    if (student.phoneNumber !== undefined) updateData.phone_number = student.phoneNumber;
    if (student.deskNumber !== undefined) updateData.desk_number = student.deskNumber;
    if (student.shift !== undefined) updateData.shift = student.shift;
    if (student.plan !== undefined) updateData.plan = student.plan;
    if (student.price !== undefined) updateData.price = student.price;
    if (student.joinDate !== undefined) updateData.join_date = student.joinDate;
    if (student.expiryDate !== undefined) updateData.expiry_date = student.expiryDate;
    if (student.paymentStatus !== undefined) updateData.payment_status = student.paymentStatus;
    if (student.paymentMethod !== undefined) updateData.payment_method = student.paymentMethod;
    if (student.lastPaymentDate !== undefined) updateData.last_payment_date = student.lastPaymentDate;
    const { error } = await supabase.from('students').update(updateData).eq('id', id).eq('owner_id', supabaseUser.id);
    if (error) { console.error('Error updating student:', error.message); setStudents(previousStudents); localStorage.setItem(`students_${supabaseUser.id}`, JSON.stringify(previousStudents)); throw error; }
  };

  const deleteStudent = async (id: string) => {
    if (!supabaseUser) return;
    const previousStudents = [...students];
    setStudents(students.filter(s => s.id !== id));
    localStorage.setItem(`students_${supabaseUser.id}`, JSON.stringify(students.filter(s => s.id !== id)));
    const { error } = await supabase.from('students').delete().eq('id', id).eq('owner_id', supabaseUser.id);
    if (error) { console.error('Error deleting student:', error.message); setStudents(previousStudents); localStorage.setItem(`students_${supabaseUser.id}`, JSON.stringify(previousStudents)); throw error; }
  };

  return (
    <StudentsContext.Provider value={{ students, addStudent, updateStudent, deleteStudent, isLoaded, refreshStudents: fetchStudents }}>
      {children}
    </StudentsContext.Provider>
  );
}

export function useStudents() {
  const context = useContext(StudentsContext);
  if (context === undefined) throw new Error('useStudents must be used within a StudentsProvider');
  return context;
}

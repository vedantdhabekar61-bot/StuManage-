'use client';

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
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { supabaseUser } = useAuth();

  const fetchStudents = useCallback(async () => {
    if (!supabaseUser) {
      setStudents([]);
      setIsLoaded(true);
      return;
    }

    // Load cached students immediately
    const cached = localStorage.getItem(`students_${supabaseUser.id}`);
    if (cached) {
      try {
        setStudents(JSON.parse(cached));
        setIsLoaded(true);
      } catch (e) {
        console.error('Failed to parse cached students', e);
      }
    }

    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('owner_id', supabaseUser.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching students:', error.message);
    } else if (data) {
      const formattedStudents: Student[] = data.map(s => ({
        id: s.id,
        studentName: s.student_name,
        phoneNumber: s.phone_number,
        deskNumber: s.desk_number,
        shift: s.shift,
        plan: s.plan,
        price: s.price,
        joinDate: s.join_date,
        expiryDate: s.expiry_date,
        paymentStatus: s.payment_status,
        paymentMethod: s.payment_method,
        lastPaymentDate: s.last_payment_date
      }));
      setStudents(formattedStudents);
      localStorage.setItem(`students_${supabaseUser.id}`, JSON.stringify(formattedStudents));
    }
    setIsLoaded(true);
  }, [supabaseUser]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStudents();
  }, [fetchStudents]);

  const addStudent = async (student: Omit<Student, 'id'>) => {
    if (!supabaseUser) return;

    const { error } = await supabase
      .from('students')
      .insert([{
        owner_id: supabaseUser.id,
        student_name: student.studentName,
        phone_number: student.phoneNumber,
        desk_number: student.deskNumber,
        shift: student.shift,
        plan: student.plan,
        price: student.price,
        join_date: student.joinDate,
        expiry_date: student.expiryDate,
        payment_status: student.paymentStatus,
        payment_method: student.paymentMethod,
        last_payment_date: student.lastPaymentDate
      }]);

    if (error) {
      console.error('Error adding student:', error.message);
      throw error;
    }
    await fetchStudents();
  };

  const updateStudent = async (id: string, student: Partial<Student>) => {
    if (!supabaseUser) return;

    const updateData: any = {};
    if (student.studentName) updateData.student_name = student.studentName;
    if (student.phoneNumber) updateData.phone_number = student.phoneNumber;
    if (student.deskNumber) updateData.desk_number = student.deskNumber;
    if (student.shift) updateData.shift = student.shift;
    if (student.plan) updateData.plan = student.plan;
    if (student.price) updateData.price = student.price;
    if (student.joinDate) updateData.join_date = student.joinDate;
    if (student.expiryDate) updateData.expiry_date = student.expiryDate;
    if (student.paymentStatus) updateData.payment_status = student.paymentStatus;
    if (student.paymentMethod) updateData.payment_method = student.paymentMethod;
    if (student.lastPaymentDate) updateData.last_payment_date = student.lastPaymentDate;

    const { error } = await supabase
      .from('students')
      .update(updateData)
      .eq('id', id)
      .eq('owner_id', supabaseUser.id);

    if (error) {
      console.error('Error updating student:', error.message);
      throw error;
    }
    await fetchStudents();
  };

  const deleteStudent = async (id: string) => {
    if (!supabaseUser) return;

    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id)
      .eq('owner_id', supabaseUser.id);

    if (error) {
      console.error('Error deleting student:', error.message);
      throw error;
    }
    await fetchStudents();
  };

  return (
    <StudentsContext.Provider value={{ students, addStudent, updateStudent, deleteStudent, isLoaded, refreshStudents: fetchStudents }}>
      {children}
    </StudentsContext.Provider>
  );
}

export function useStudents() {
  const context = useContext(StudentsContext);
  if (context === undefined) {
    throw new Error('useStudents must be used within a StudentsProvider');
  }
  return context;
}

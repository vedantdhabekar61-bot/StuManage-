'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Student } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';

const STUDENTS_KEY = 'libmanager_students';

interface StudentContextType {
  students: Student[];
  isLoaded: boolean;
  addStudent: (student: Omit<Student, 'id'>) => Promise<Student>;
  updateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  refreshStudents: () => Promise<void>;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export function StudentProvider({ children }: { children: React.ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();

  const fetchStudents = useCallback(async () => {
    if (!user) {
      const saved = localStorage.getItem(STUDENTS_KEY);
      if (saved) {
        try {
          setStudents(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse local students', e);
        }
      }
      setIsLoaded(true);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('owner_id', user.id);

      if (error) {
        console.warn('Supabase fetch error, falling back to local storage:', error.message);
        const saved = localStorage.getItem(STUDENTS_KEY);
        if (saved) setStudents(JSON.parse(saved));
      } else if (data) {
        const mappedData = data.map(dbStudent => ({
          id: dbStudent.id,
          studentName: dbStudent.student_name,
          phoneNumber: dbStudent.phone_number,
          deskNumber: parseInt(dbStudent.desk_number),
          shift: dbStudent.shift,
          price: parseFloat(dbStudent.price),
          paymentStatus: dbStudent.payment_status,
          joinDate: dbStudent.join_date,
          expiryDate: dbStudent.expiry_date,
          lastPaymentDate: dbStudent.last_payment_date,
          plan: dbStudent.plan || 'Custom Plan',
          paymentMethod: dbStudent.payment_method || 'UPI',
        }));
        setStudents(mappedData as Student[]);
        localStorage.setItem(STUDENTS_KEY, JSON.stringify(mappedData));
      }
    } catch (e) {
      console.error('Failed to fetch students from Supabase', e);
      const saved = localStorage.getItem(STUDENTS_KEY);
      if (saved) setStudents(JSON.parse(saved));
    } finally {
      setIsLoaded(true);
    }
  }, [user]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const addStudent = async (student: Omit<Student, 'id'>) => {
    // Check student limit for free users
    const isPro = user?.subscription?.status === 'active' || false;
    if (!isPro && students.length >= 20) {
      throw new Error('Free limit reached (20 students). Please upgrade to Pro for unlimited students.');
    }

    // Check if desk is already taken in the same shift
    const isDeskTaken = students.some(s => 
      s.deskNumber === student.deskNumber && 
      (s.shift === student.shift || s.shift === 'Full Day' || student.shift === 'Full Day')
    );

    if (isDeskTaken) {
      throw new Error(`Desk ${student.deskNumber} is already occupied for this shift.`);
    }

    const newStudent = {
      ...student,
      id: crypto.randomUUID(),
    };

    // Optimistic update
    setStudents(prev => {
      const updated = [...prev, newStudent];
      localStorage.setItem(STUDENTS_KEY, JSON.stringify(updated));
      return updated;
    });

    if (user) {
      try {
        const dbStudent = {
          id: newStudent.id,
          owner_id: user.id,
          student_name: newStudent.studentName,
          phone_number: newStudent.phoneNumber,
          desk_number: newStudent.deskNumber.toString(),
          shift: newStudent.shift,
          price: newStudent.price,
          payment_status: newStudent.paymentStatus,
          join_date: newStudent.joinDate,
          expiry_date: newStudent.expiryDate,
          last_payment_date: newStudent.lastPaymentDate,
          plan: newStudent.plan,
          payment_method: newStudent.paymentMethod,
        };

        const { error } = await supabase
          .from('students')
          .insert([dbStudent]);
        
        if (error) {
          console.error('Supabase insert error:', error.message);
        }
      } catch (e) {
        console.error('Failed to add student to Supabase', e);
      }
    }

    return newStudent;
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    // Check for desk occupancy conflict if desk or shift is changing
    if (updates.deskNumber !== undefined || updates.shift !== undefined) {
      const studentToUpdate = students.find(s => s.id === id);
      if (studentToUpdate) {
        const newDesk = updates.deskNumber ?? studentToUpdate.deskNumber;
        const newShift = updates.shift ?? studentToUpdate.shift;
        
        const isDeskTaken = students.some(s => 
          s.id !== id && // Don't check against self
          s.deskNumber === newDesk && 
          (s.shift === newShift || s.shift === 'Full Day' || newShift === 'Full Day')
        );

        if (isDeskTaken) {
          throw new Error(`Desk ${newDesk} is already occupied for the ${newShift} shift.`);
        }
      }
    }

    // Optimistic update
    setStudents(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, ...updates } : s);
      localStorage.setItem(STUDENTS_KEY, JSON.stringify(updated));
      return updated;
    });

    if (user) {
      try {
        const dbUpdates: any = {};
        if (updates.studentName) dbUpdates.student_name = updates.studentName;
        if (updates.phoneNumber) dbUpdates.phone_number = updates.phoneNumber;
        if (updates.deskNumber !== undefined) dbUpdates.desk_number = updates.deskNumber.toString();
        if (updates.shift) dbUpdates.shift = updates.shift;
        if (updates.price !== undefined) dbUpdates.price = updates.price;
        if (updates.paymentStatus) dbUpdates.payment_status = updates.paymentStatus;
        if (updates.joinDate) dbUpdates.join_date = updates.joinDate;
        if (updates.expiryDate) dbUpdates.expiry_date = updates.expiryDate;
        if (updates.lastPaymentDate) dbUpdates.last_payment_date = updates.lastPaymentDate;
        if (updates.plan) dbUpdates.plan = updates.plan;
        if (updates.paymentMethod) dbUpdates.payment_method = updates.paymentMethod;

        const { error } = await supabase
          .from('students')
          .update(dbUpdates)
          .eq('id', id)
          .eq('owner_id', user.id);
        
        if (error) {
          console.error('Supabase update error:', error.message);
        }
      } catch (e) {
        console.error('Failed to update student in Supabase', e);
      }
    }
  };

  const deleteStudent = async (id: string) => {
    // Optimistic update
    setStudents(prev => {
      const updated = prev.filter(s => s.id !== id);
      localStorage.setItem(STUDENTS_KEY, JSON.stringify(updated));
      return updated;
    });

    if (user) {
      try {
        const { error } = await supabase
          .from('students')
          .delete()
          .eq('id', id)
          .eq('owner_id', user.id);
        
        if (error) {
          console.error('Supabase delete error:', error.message);
        }
      } catch (e) {
        console.error('Failed to delete student from Supabase', e);
      }
    }
  };

  return (
    <StudentContext.Provider value={{ 
      students, 
      isLoaded, 
      addStudent, 
      updateStudent, 
      deleteStudent,
      refreshStudents: fetchStudents
    }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudents() {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error('useStudents must be used within a StudentProvider');
  }
  return context;
}

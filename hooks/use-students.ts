'use client';

import { useState, useEffect } from 'react';
import { Student } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';

const STUDENTS_KEY = 'libmanager_students';

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStudents = async () => {
      if (!user) {
        // Fallback to local storage if not logged in
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
          .eq('user_id', user.id);

        if (error) {
          // If table doesn't exist or other error, fallback to local storage
          if (error.code === 'PGRST116' || error.message.includes('schema cache')) {
            console.warn('Supabase table missing. Please run the SQL schema in your Supabase dashboard.');
          } else {
            console.warn('Supabase fetch error, falling back to local storage:', error.message);
          }
          const saved = localStorage.getItem(STUDENTS_KEY);
          if (saved) setStudents(JSON.parse(saved));
        } else if (data) {
          setStudents(data as Student[]);
        }
      } catch (e) {
        console.error('Failed to fetch students from Supabase', e);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchStudents();
  }, [user]);

  const addStudent = async (student: Omit<Student, 'id'>) => {
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
        const { error } = await supabase
          .from('students')
          .insert([{ ...newStudent, user_id: user.id }]);
        
        if (error) {
          if (error.message.includes('schema cache')) {
            console.warn('Supabase table missing. Student saved locally only.');
          } else {
            console.error('Supabase insert error:', error.message);
          }
          // Revert if critical, but for now we keep local as source of truth
        }
      } catch (e) {
        console.error('Failed to add student to Supabase', e);
      }
    }

    return newStudent;
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    if (user) {
      try {
        const { error } = await supabase
          .from('students')
          .update(updates)
          .eq('id', id)
          .eq('user_id', user.id);
        
        if (error) {
          if (error.message.includes('schema cache')) {
            console.warn('Supabase table missing. Student updated locally only.');
          } else {
            console.error('Supabase update error:', error.message);
          }
        }
      } catch (e) {
        console.error('Failed to update student in Supabase', e);
      }
    }

    setStudents(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, ...updates } : s);
      localStorage.setItem(STUDENTS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const deleteStudent = async (id: string) => {
    if (user) {
      try {
        const { error } = await supabase
          .from('students')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
        
        if (error) {
          if (error.message.includes('schema cache')) {
            console.warn('Supabase table missing. Student deleted locally only.');
          } else {
            console.error('Supabase delete error:', error.message);
          }
        }
      } catch (e) {
        console.error('Failed to delete student from Supabase', e);
      }
    }

    setStudents(prev => {
      const updated = prev.filter(s => s.id !== id);
      localStorage.setItem(STUDENTS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return { students, isLoaded, addStudent, updateStudent, deleteStudent };
}

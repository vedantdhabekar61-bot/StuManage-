'use client';

import { useState, useEffect } from 'react';
import { Student } from '@/lib/types';
import { MOCK_STUDENTS } from '@/lib/mock-data';

const STUDENTS_KEY = 'libmanager_students';

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadData = () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(STUDENTS_KEY);
        if (saved) {
          try {
            setStudents(JSON.parse(saved));
          } catch (e) {
            console.error('Failed to parse students', e);
            setStudents(MOCK_STUDENTS);
          }
        } else {
          setStudents(MOCK_STUDENTS);
          localStorage.setItem(STUDENTS_KEY, JSON.stringify(MOCK_STUDENTS));
        }
        setIsLoaded(true);
      }
    };

    loadData();

    // Cross-tab synchronization
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STUDENTS_KEY && e.newValue) {
        setStudents(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addStudent = (student: Omit<Student, 'id'>) => {
    const newStudent = {
      ...student,
      id: crypto.randomUUID(),
    };
    setStudents(prev => {
      const updated = [...prev, newStudent];
      localStorage.setItem(STUDENTS_KEY, JSON.stringify(updated));
      return updated;
    });
    return newStudent;
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, ...updates } : s);
      localStorage.setItem(STUDENTS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => {
      const updated = prev.filter(s => s.id !== id);
      localStorage.setItem(STUDENTS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return { students, isLoaded, addStudent, updateStudent, deleteStudent };
}

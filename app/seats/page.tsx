'use client';

import { useState } from 'react';
import { Desk } from '@/components/desk';
import { Shift } from '@/lib/types';
import { useSettings } from '@/hooks/use-settings';
import { useStudents } from '@/hooks/use-students';
import { Settings as SettingsIcon, Check, X, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';

export default function SeatsPage() {
  const router = useRouter();
  const [activeShift, setActiveShift] = useState<Shift>('Morning');
  const { settings, updateSettings } = useSettings();
  const { students } = useStudents();
  const [isEditing, setIsEditing] = useState(false);
  const [tempSeats, setTempSeats] = useState(settings.totalSeats);

  const desks = Array.from({ length: settings.totalSeats }, (_, i) => {
    const deskNumber = i + 1;
    const student = students.find(s => s.deskNumber === deskNumber && (s.shift === activeShift || s.shift === 'Full Day'));
    return {
      number: deskNumber,
      status: student ? 'Booked' : 'Available',
      studentName: student?.name,
      shift: student?.shift
    };
  });

  const handleSaveSeats = () => {
    updateSettings({ totalSeats: Number(tempSeats) });
    setIsEditing(false);
  };

  return (
    <main className="flex flex-col gap-6 p-6 pb-24">
      <header className="flex flex-col gap-4">
        <button 
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Seat Layout</h1>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                setIsEditing(!isEditing);
                setTempSeats(settings.totalSeats);
              }}
              className={`rounded-full p-2 transition-colors ${isEditing ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}
            >
              <SettingsIcon className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Free</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-rose-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Booked</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Capacity Panel */}
        {isEditing && (
          <div className="flex items-center gap-3 rounded-2xl bg-indigo-50 p-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Total Capacity</span>
              <input 
                type="number" 
                className="w-20 rounded-lg border border-indigo-100 bg-white px-2 py-1 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={tempSeats}
                onChange={(e) => setTempSeats(Number(e.target.value))}
              />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button 
                onClick={handleSaveSeats}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm transition-transform active:scale-95"
              >
                <Check className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setIsEditing(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm transition-transform active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Shift Selector */}
        <div className="flex items-center gap-2 rounded-2xl bg-slate-100 p-1">
          {(['Morning', 'Evening', 'Full Day'] as Shift[]).map((s) => (
            <button
              key={s}
              onClick={() => setActiveShift(s)}
              className={`flex-1 rounded-xl py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                activeShift === s 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </header>

      {/* Desk Grid */}
      <div className="grid grid-cols-4 gap-3">
        <AnimatePresence mode="popLayout">
          {desks.map((desk) => (
            <motion.div
              key={desk.number}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Desk 
                number={desk.number}
                status={desk.status as any}
                studentName={desk.studentName}
                shift={desk.shift}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Legend / Info */}
      <div className="rounded-2xl bg-indigo-50 p-4">
        <p className="text-xs font-medium text-indigo-700">
          Showing availability for <span className="font-bold">{activeShift}</span> shift. 
          Desks marked in red are occupied by students in this shift or full-day students.
        </p>
      </div>
    </main>
  );
}

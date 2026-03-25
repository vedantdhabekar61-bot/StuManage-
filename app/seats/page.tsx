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
    <main className="flex min-h-screen flex-col bg-slate-50 pb-24">
      <header className="flex flex-col gap-6 px-6 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm text-slate-500 transition-all active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-slate-900">Seat Layout</h1>
          <button 
            onClick={() => {
              setIsEditing(!isEditing);
              setTempSeats(settings.totalSeats);
            }}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-95",
              isEditing ? "bg-teal-500 text-white shadow-lg shadow-teal-100" : "bg-white shadow-sm text-slate-500"
            )}
          >
            <SettingsIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Shift Selector */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {(['Morning', 'Evening', 'Full Day'] as Shift[]).map((s) => (
            <button
              key={s}
              onClick={() => setActiveShift(s)}
              className={cn(
                "rounded-full px-6 py-2 text-xs font-bold transition-all active:scale-95 whitespace-nowrap",
                activeShift === s 
                  ? "bg-teal-500 text-white shadow-lg shadow-teal-100" 
                  : "bg-white text-slate-500 shadow-sm"
              )}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-2">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-teal-500 shadow-sm shadow-teal-100" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-slate-200" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available</span>
          </div>
        </div>

        {/* Edit Capacity Panel */}
        {isEditing && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="soft-card p-4 flex items-center justify-between bg-teal-50 border-teal-100"
          >
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">Total Capacity</span>
              <input 
                type="number" 
                className="w-24 rounded-xl border-none bg-white px-3 py-2 text-sm font-bold shadow-sm focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                value={tempSeats}
                onChange={(e) => setTempSeats(Number(e.target.value))}
              />
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleSaveSeats}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500 text-white shadow-lg shadow-teal-100 transition-all active:scale-95"
              >
                <Check className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setIsEditing(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm transition-all active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </header>

      {/* Desk Grid */}
      <div className="flex flex-col gap-8 px-6">
        {/* Zone A */}
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Zone A</h2>
          <div className="grid grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {desks.slice(0, Math.ceil(desks.length / 2)).map((desk) => (
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
        </section>

        {/* Zone B */}
        {desks.length > Math.ceil(desks.length / 2) && (
          <section className="flex flex-col gap-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Zone B</h2>
            <div className="grid grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {desks.slice(Math.ceil(desks.length / 2)).map((desk) => (
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
          </section>
        )}
      </div>
    </main>
  );
}

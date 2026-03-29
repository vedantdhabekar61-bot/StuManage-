'use client';

import { useState } from 'react';
import { Desk } from '@/components/desk';
import { Shift } from '@/lib/types';
import { useSettings } from '@/hooks/use-settings';
import { useStudents } from '@/hooks/use-students';
import { Settings as SettingsIcon, Check, X, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

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
      studentName: student?.studentName,
      shift: student?.shift
    };
  });

  const handleSaveSeats = () => {
    updateSettings({ totalSeats: Number(tempSeats) });
    setIsEditing(false);
  };

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
            <h1 className="text-[24px] font-extrabold tracking-tight text-[#1C1917]">Seat Layout</h1>
          </div>
          <button 
            onClick={() => {
              setIsEditing(!isEditing);
              setTempSeats(settings.totalSeats);
            }}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95",
              isEditing ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white shadow-[0_4px_14px_rgba(28,25,23,0.05)] text-[#78716C]"
            )}
          >
            <SettingsIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Shift Selector */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 mb-4">
          {(['Morning', 'Afternoon', 'Evening', 'Full Day'] as Shift[]).map((s) => (
            <button
              key={s}
              onClick={() => setActiveShift(s)}
              className={cn(
                "whitespace-nowrap px-5 py-2 rounded-full text-[13px] font-bold tracking-wide transition-all active:scale-95 flex-shrink-0",
                activeShift === s 
                  ? "bg-primary/10 text-primary" 
                  : "bg-transparent text-[#78716C] border border-[#dee4e1]/30"
              )}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary shadow-sm" />
            <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-white border border-gray-200" />
            <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">Available</span>
          </div>
        </div>

        {/* Edit Capacity Panel */}
        <AnimatePresence>
          {isEditing && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white rounded-2xl p-4 mb-4 shadow-[0_4px_14px_rgba(28,25,23,0.05)] flex items-center justify-between border border-primary/10">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Total Capacity</span>
                  <input 
                    type="number" 
                    className="w-24 bg-[#FDFBF7] border-none rounded-xl px-3 py-2 text-[15px] font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                    value={tempSeats}
                    onChange={(e) => setTempSeats(Number(e.target.value))}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleSaveSeats}
                    className="w-10 h-10 rounded-full bg-primary text-white shadow-lg shadow-primary/20 flex items-center justify-center active:scale-95 transition-transform"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="w-10 h-10 rounded-full bg-[#FDFBF7] text-[#78716C] flex items-center justify-center active:scale-95 transition-transform"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Desk Grid */}
      <div className="flex flex-col gap-8 px-4 mt-4">
        {/* Zone A */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-bold text-[#78716C] uppercase tracking-widest">Zone A</h2>
            <span className="text-[11px] font-bold text-[#78716C]/50">{Math.ceil(desks.length / 2)} Seats</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
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
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-bold text-[#78716C] uppercase tracking-widest">Zone B</h2>
              <span className="text-[11px] font-bold text-[#78716C]/50">{desks.length - Math.ceil(desks.length / 2)} Seats</span>
            </div>
            <div className="grid grid-cols-4 gap-3">
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

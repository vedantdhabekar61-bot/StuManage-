import { useMemo } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, LayoutGrid } from 'lucide-react';
import { useStudents } from '@/hooks/use-students';
import { useSettings } from '@/hooks/use-settings';
import { Desk } from '@/components/desk';

export default function SeatsPage() {
  const [, navigate] = useLocation();
  const { students, isLoaded } = useStudents();
  const { settings } = useSettings();

  const seats = useMemo(() => {
    const arr = [];
    for (let i = 1; i <= settings.totalSeats; i++) {
      const occupant = students.find(s => s.deskNumber === i);
      arr.push({ number: i, status: occupant ? 'Booked' as const : 'Available' as const, studentName: occupant?.studentName, shift: occupant?.shift });
    }
    return arr;
  }, [students, settings.totalSeats]);

  const available = seats.filter(s => s.status === 'Available').length;
  const booked = seats.filter(s => s.status === 'Booked').length;

  if (!isLoaded) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <main className="flex min-h-screen flex-col bg-background pb-24">
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur-md pb-4 pt-6 px-4 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/')} className="w-11 h-11 rounded-full bg-card shadow-soft flex items-center justify-center text-muted active:scale-95 transition-transform"><ArrowLeft className="h-5 w-5" /></button>
          <h1 className="text-[24px] font-extrabold tracking-tight text-foreground">Seat Map</h1>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-card rounded-2xl px-4 py-2 shadow-soft">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-[13px] font-bold text-foreground">{booked} Occupied</span>
          </div>
          <div className="flex items-center gap-2 bg-card rounded-2xl px-4 py-2 shadow-soft">
            <div className="w-3 h-3 rounded-full bg-border" />
            <span className="text-[13px] font-bold text-muted">{available} Available</span>
          </div>
        </div>
      </header>

      {seats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-40 px-6">
          <LayoutGrid className="h-12 w-12 mb-4" />
          <p className="font-bold">No seats configured</p>
          <p className="text-sm mt-1">Update total seats in your settings</p>
        </div>
      ) : (
        <div className="px-4 pt-4">
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {seats.map(seat => <Desk key={seat.number} number={seat.number} status={seat.status} studentName={seat.studentName} shift={seat.shift} />)}
          </div>
        </div>
      )}
    </main>
  );
}

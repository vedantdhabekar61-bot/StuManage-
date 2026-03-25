import { cn } from '@/lib/utils';

interface DeskProps {
  number: number;
  status: 'Available' | 'Booked';
  studentName?: string;
  shift?: string;
}

export function Desk({ number, status, studentName, shift }: DeskProps) {
  return (
    <div className={cn(
      "flex aspect-square flex-col items-center justify-center rounded-2xl transition-all active:scale-95 shadow-sm",
      status === 'Booked' 
        ? "bg-teal-500 text-white shadow-teal-100" 
        : "bg-white text-slate-400 border border-slate-100"
    )}>
      <span className="text-xl font-bold">{number}</span>
      <span className={cn(
        "text-[9px] font-bold uppercase tracking-wider",
        status === 'Booked' ? "opacity-80" : "opacity-40"
      )}>
        {status === 'Booked' ? 'Occupied' : 'Free'}
      </span>
      {studentName && (
        <span className="mt-1 max-w-[80%] truncate text-[8px] font-medium opacity-90">
          {studentName.split(' ')[0]}
        </span>
      )}
    </div>
  );
}

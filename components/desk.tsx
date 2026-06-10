import { cn } from '@/lib/utils';

interface DeskProps {
  number: number;
  status: 'Available' | 'Booked';
  studentName?: string;
  shift?: string;
}

export function Desk({ number, status, studentName, shift }: DeskProps) {
  const initials = studentName ? studentName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '';

  return (
    <div className={cn(
      "flex aspect-square flex-col items-center justify-center rounded-2xl transition-all active:scale-95 shadow-[0_4px_14px_rgba(28,25,23,0.05)] relative overflow-hidden",
      status === 'Booked' 
        ? "bg-primary text-white" 
        : "bg-white text-[#78716C] border border-[#dee4e1]/50"
    )}>
      {status === 'Booked' && initials && (
        <div className="absolute top-1.5 right-1.5 bg-white/20 rounded-md px-1 py-0.5 text-[8px] font-black tracking-tighter">
          {initials}
        </div>
      )}
      <span className="text-[20px] font-extrabold leading-none">{number}</span>
      <span className={cn(
        "text-[10px] font-bold uppercase tracking-wider mt-1",
        status === 'Booked' ? "opacity-80" : "opacity-40"
      )}>
        {status === 'Booked' ? 'Occupied' : 'Free'}
      </span>
      {studentName && (
        <span className="mt-1 max-w-[85%] truncate text-[9px] font-bold opacity-90">
          {studentName.split(' ')[0]}
        </span>
      )}
    </div>
  );
}

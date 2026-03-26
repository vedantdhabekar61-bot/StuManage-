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
      "flex aspect-square flex-col items-center justify-center rounded-2xl transition-all active:scale-95 shadow-[0_4px_14px_rgba(28,25,23,0.05)]",
      status === 'Booked' 
        ? "bg-primary text-white" 
        : "bg-white text-[#78716C] border border-transparent"
    )}>
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

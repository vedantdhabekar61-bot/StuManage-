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
      'flex aspect-square flex-col items-center justify-center rounded-2xl border-2 p-2 transition-all active:scale-95',
      status === 'Booked' 
        ? 'border-rose-100 bg-rose-50 text-rose-600' 
        : 'border-emerald-100 bg-emerald-50 text-emerald-600'
    )}>
      <span className="text-lg font-bold">{number}</span>
      <span className="text-[8px] font-bold uppercase tracking-wider opacity-60">
        {status === 'Booked' ? 'Booked' : 'Free'}
      </span>
      {studentName && (
        <span className="mt-1 max-w-full truncate text-[8px] font-medium text-rose-400">
          {studentName.split(' ')[0]}
        </span>
      )}
    </div>
  );
}

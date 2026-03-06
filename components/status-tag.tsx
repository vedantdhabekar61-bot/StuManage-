import { PaymentStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StatusTagProps {
  status: PaymentStatus | 'Active' | 'Expired' | 'Expiring Soon';
}

export function StatusTag({ status }: StatusTagProps) {
  const styles = {
    Paid: 'bg-emerald-100 text-emerald-700',
    Active: 'bg-emerald-100 text-emerald-700',
    Pending: 'bg-amber-100 text-amber-700',
    'Expiring Soon': 'bg-amber-100 text-amber-700',
    Overdue: 'bg-rose-100 text-rose-700',
    Expired: 'bg-rose-100 text-rose-700',
  };

  return (
    <span className={cn(
      'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
      styles[status as keyof typeof styles] || 'bg-slate-100 text-slate-600'
    )}>
      {status}
    </span>
  );
}

import { PaymentStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StatusTagProps {
  status: PaymentStatus | 'Active' | 'Expired' | 'Expiring Soon';
}

export function StatusTag({ status }: StatusTagProps) {
  const styles = {
    Paid: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    Active: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    Pending: 'bg-amber-50 text-amber-600 border-amber-100',
    'Expiring Soon': 'bg-amber-50 text-amber-600 border-amber-100',
    Overdue: 'bg-rose-50 text-rose-600 border-rose-100',
    Expired: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  return (
    <span className={cn(
      'status-pill border',
      styles[status as keyof typeof styles] || 'bg-slate-50 text-slate-600 border-slate-100'
    )}>
      {status}
    </span>
  );
}

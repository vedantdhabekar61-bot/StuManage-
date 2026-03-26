import { PaymentStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StatusTagProps {
  status: PaymentStatus | 'Active' | 'Expired' | 'Expiring Soon';
}

export function StatusTag({ status }: StatusTagProps) {
  const styles = {
    Paid: 'bg-[#25D366]/10 text-[#25D366]',
    Active: 'bg-[#25D366]/10 text-[#25D366]',
    Pending: 'bg-[#F59E0B]/10 text-[#F59E0B]',
    'Expiring Soon': 'bg-[#F59E0B]/10 text-[#F59E0B]',
    Overdue: 'bg-[#F59E0B]/10 text-[#F59E0B]',
    Expired: 'bg-[#F59E0B]/10 text-[#F59E0B]',
  };

  return (
    <span className={cn(
      'inline-flex items-center justify-center h-6 px-2.5 rounded-full text-[12px] font-bold tracking-wide',
      styles[status as keyof typeof styles] || 'bg-slate-100 text-[#78716C]'
    )}>
      {status}
    </span>
  );
}

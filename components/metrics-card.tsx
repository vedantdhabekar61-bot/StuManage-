import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  className?: string;
}

export function MetricsCard({ label, value, icon: Icon, className }: MetricsCardProps) {
  return (
    <div className={cn(
      "soft-card p-5 flex flex-col items-start gap-4 transition-all hover:scale-[1.02]",
      className
    )}>
      <div className="rounded-2xl bg-teal-50 p-3 text-teal-500">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <div className="text-sm font-medium text-slate-500">{label}</div>
      </div>
    </div>
  );
}

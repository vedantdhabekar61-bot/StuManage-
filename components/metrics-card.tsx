import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  className?: string;
}

export function MetricsCard({ label, value, icon: Icon, className, trend }: MetricsCardProps & { trend?: string }) {
  return (
    <div className={cn(
      "bg-card rounded-2xl p-4 shadow-soft flex flex-col justify-between h-[120px] transition-all hover:scale-[1.01] border border-border/10",
      className
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <div>
        <div className="text-3xl font-extrabold text-foreground tracking-tight">{value}</div>
        <div className="text-sm font-semibold text-muted mt-0.5">{label}</div>
      </div>
    </div>
  );
}

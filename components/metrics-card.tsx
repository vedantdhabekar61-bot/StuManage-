import { LucideIcon } from 'lucide-react';

interface MetricsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  subtext?: string;
}

export function MetricsCard({ label, value, icon: Icon, color, subtext }: MetricsCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className={`rounded-lg ${color} p-2 text-white`}>
          <Icon className="h-4 w-4" />
        </div>
        {subtext && <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{subtext}</span>}
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
        <span className="text-xs font-medium text-slate-500">{label}</span>
      </div>
    </div>
  );
}

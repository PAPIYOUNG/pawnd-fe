import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

type StatTone = 'emerald' | 'blue' | 'red' | 'amber';

const TONE_CLASSES: Record<StatTone, string> = {
  emerald: 'bg-emerald-500/10 text-emerald-600',
  blue: 'bg-blue-500/10 text-blue-600',
  red: 'bg-red-500/10 text-red-600',
  amber: 'bg-amber-500/10 text-amber-600',
};

interface StatCardProps {
  label: string;
  value: string;
  changeLabel?: string;
  changeDirection?: 'up' | 'down';
  icon: LucideIcon;
  tone: StatTone;
}

export function StatCard({
  label,
  value,
  changeLabel,
  changeDirection,
  icon: Icon,
  tone,
}: StatCardProps) {
  return (
    <div className="flex flex-1 flex-col gap-3 rounded-3xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span
          className={cn(
            'flex size-7 items-center justify-center rounded-full',
            TONE_CLASSES[tone],
          )}
        >
          <Icon className="size-3.5" />
        </span>
      </div>
      <span className="text-2xl font-bold text-foreground">{value}</span>
      {changeLabel && (
        <span
          className={cn(
            'text-xs font-medium',
            changeDirection === 'up' ? 'text-emerald-600' : 'text-red-600',
          )}
        >
          {changeLabel}
        </span>
      )}
    </div>
  );
}

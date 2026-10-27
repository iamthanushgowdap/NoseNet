import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number | string;
  subtext?: string;
  icon: LucideIcon;
  variant?: 'cyan' | 'blue' | 'purple' | 'amber' | 'emerald';
}

export function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  variant = 'cyan',
}: StatCardProps) {
  const variantStyles = {
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 hover:border-slate-700/80 transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>
        <div className={cn('p-2 rounded-xl border', variantStyles[variant])}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">{value}</div>
        {subtext && <p className="text-[11px] text-slate-400 mt-1 truncate">{subtext}</p>}
      </div>
    </div>
  );
}

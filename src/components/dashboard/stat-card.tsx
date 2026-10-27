import React from 'react';
import { LucideIcon } from 'lucide-react';

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
}: StatCardProps) {
  return (
    <div className="bg-black border border-neutral-800 rounded-xl p-5 hover:border-neutral-600 transition-colors flex flex-col justify-between text-white shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">{label}</span>
        <div className="p-2 rounded-lg border border-neutral-700 bg-neutral-900 text-white">
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">{value}</div>
        {subtext && <p className="text-[11px] text-neutral-400 mt-1 truncate">{subtext}</p>}
      </div>
    </div>
  );
}

import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'fresh'
    | 'average'
    | 'not-good'
    | 'active'
    | 'completed'
    | 'draft'
    | 'archived'
    | 'planned'
    | 'testing'
    | 'invalid'
    | 'stage'
    | 'cyan'
    | 'outline';
  size?: 'sm' | 'md';
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const baseClasses =
    'inline-flex items-center font-medium rounded-full tracking-wide select-none transition-colors';

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-0.5 gap-1.5',
  };

  const variantClasses = {
    default:
      'bg-slate-800 text-slate-300 border border-slate-700 dark:bg-slate-800/80 dark:text-slate-300',
    fresh:
      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300',
    average:
      'bg-amber-500/10 text-amber-400 border border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-300',
    'not-good':
      'bg-rose-500/10 text-rose-400 border border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-300',
    active:
      'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 dark:bg-cyan-950/40 dark:text-cyan-300',
    completed:
      'bg-emerald-500/10 text-emerald-300 border border-emerald-500/25',
    draft:
      'bg-slate-700/30 text-slate-400 border border-slate-700/50',
    archived:
      'bg-slate-800/50 text-slate-500 border border-slate-700/40',
    planned:
      'bg-blue-500/10 text-blue-400 border border-blue-500/30',
    testing:
      'bg-amber-500/15 text-amber-300 border border-amber-500/40 animate-pulse',
    invalid:
      'bg-rose-500/10 text-rose-400 border border-rose-500/30',
    stage:
      'bg-purple-500/10 text-purple-300 border border-purple-500/30',
    cyan:
      'bg-cyan-500/20 text-cyan-200 border border-cyan-400/30',
    outline:
      'bg-transparent text-slate-400 border border-slate-700',
  };

  return (
    <span className={cn(baseClasses, sizeClasses[size], variantClasses[variant], className)} {...props}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'Fresh':
      return <Badge variant="fresh">Fresh</Badge>;
    case 'Average':
      return <Badge variant="average">Average</Badge>;
    case 'Not Good':
      return <Badge variant="not-good">Not Good</Badge>;
    case 'Active':
      return <Badge variant="active">Active</Badge>;
    case 'Completed':
      return <Badge variant="completed">Completed</Badge>;
    case 'Draft':
      return <Badge variant="draft">Draft</Badge>;
    case 'Archived':
      return <Badge variant="archived">Archived</Badge>;
    case 'Planned':
      return <Badge variant="planned">Planned</Badge>;
    case 'Testing':
      return <Badge variant="testing">Testing</Badge>;
    case 'Invalid':
      return <Badge variant="invalid">Invalid</Badge>;
    case 'ROOM':
      return <Badge variant="stage">ROOM</Badge>;
    case 'EMPTY_CONTAINER':
      return <Badge variant="stage">CONTAINER</Badge>;
    case 'CAKE':
      return <Badge variant="cyan">CAKE</Badge>;
    default:
      return <Badge variant="default">{status}</Badge>;
  }
}

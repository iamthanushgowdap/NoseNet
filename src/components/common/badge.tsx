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
    | 'white'
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
    'inline-flex items-center font-semibold rounded-md tracking-wider uppercase select-none transition-colors';

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  const variantClasses = {
    default:
      'bg-black text-white border border-neutral-700',
    fresh:
      'bg-black text-white border border-neutral-600',
    average:
      'bg-black text-white border border-neutral-600',
    'not-good':
      'bg-black text-white border border-neutral-600',
    active:
      'bg-white text-black font-bold border border-white',
    completed:
      'bg-black text-white border border-neutral-600',
    draft:
      'bg-black text-neutral-300 border border-neutral-700',
    archived:
      'bg-black text-neutral-400 border border-neutral-800',
    planned:
      'bg-black text-white border border-neutral-600',
    testing:
      'bg-black text-white border border-neutral-500 animate-pulse',
    invalid:
      'bg-black text-white border border-neutral-600',
    stage:
      'bg-black text-white border border-neutral-700',
    white:
      'bg-white text-black font-bold border border-white',
    outline:
      'bg-black text-white border border-neutral-700',
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
      return <Badge variant="white">CAKE</Badge>;
    default:
      return <Badge variant="default">{status}</Badge>;
  }
}

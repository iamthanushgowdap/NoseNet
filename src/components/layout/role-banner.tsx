'use client';

import React from 'react';
import { useApp } from '@/context/app-context';
import { ShieldAlert, Users, UserCheck } from 'lucide-react';
import Link from 'next/link';

export function RoleBanner() {
  const { session, switchRole } = useApp();

  if (!session) return null;

  return (
    <div className="bg-slate-900/90 border-b border-cyan-500/20 px-4 py-2 text-xs text-slate-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shrink-0">
            <ShieldAlert className="w-3 h-3" />
          </span>
          <div>
            <span className="font-semibold text-cyan-300 uppercase tracking-wider text-[10px] mr-2 px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60">
              Demo Mode
            </span>
            <span>
              Signed in locally as <strong className="text-slate-100">{session.displayName}</strong> (
              <span className="capitalize text-cyan-400 font-medium">{session.role}</span>).
              Data is stored only in this browser (localStorage).
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <span className="text-slate-500 hidden md:inline">Switch Role:</span>
          {session.role === 'researcher' ? (
            <button
              onClick={() => switchRole('assessor')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors text-[11px]"
            >
              <Users className="w-3 h-3 text-amber-400" />
              Switch to Assessor
            </button>
          ) : (
            <button
              onClick={() => switchRole('researcher')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors text-[11px]"
            >
              <UserCheck className="w-3 h-3 text-cyan-400" />
              Switch to Researcher
            </button>
          )}

          <Link
            href="/login"
            className="text-slate-400 hover:text-slate-200 underline underline-offset-2 ml-1 text-[11px]"
          >
            Change User
          </Link>
        </div>
      </div>
    </div>
  );
}

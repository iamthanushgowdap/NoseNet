'use client';

import React from 'react';
import { useApp } from '@/context/app-context';
import { ShieldAlert, Users, UserCheck } from 'lucide-react';
import Link from 'next/link';

export function RoleBanner() {
  const { session, switchRole } = useApp();

  if (!session) return null;

  return (
    <div className="bg-black border-b border-neutral-800 px-4 py-2 text-xs text-white">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-neutral-900 text-white border border-neutral-700 shrink-0">
            <ShieldAlert className="w-3 h-3 text-white" />
          </span>
          <div>
            <span className="font-semibold text-white uppercase tracking-wider text-[10px] mr-2 px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-700">
              Demo Environment
            </span>
            <span className="text-white">
              Signed in as <strong className="text-white underline">{session.displayName}</strong> (
              <span className="capitalize text-white font-bold">{session.role}</span>).
              Persistent in this local browser session.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <span className="text-neutral-400 hidden md:inline">Switch Role:</span>
          {session.role === 'researcher' ? (
            <button
              onClick={() => switchRole('assessor')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 transition-colors text-[11px]"
            >
              <Users className="w-3 h-3 text-white" />
              Switch to Assessor
            </button>
          ) : (
            <button
              onClick={() => switchRole('researcher')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 transition-colors text-[11px]"
            >
              <UserCheck className="w-3 h-3 text-white" />
              Switch to Researcher
            </button>
          )}

          <Link
            href="/login"
            className="text-white hover:text-neutral-300 underline underline-offset-2 ml-1 text-[11px]"
          >
            Change User
          </Link>
        </div>
      </div>
    </div>
  );
}

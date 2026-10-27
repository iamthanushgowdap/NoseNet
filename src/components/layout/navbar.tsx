'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/app-context';
import { useTheme } from '@/context/theme-context';
import {
  Activity,
  Layers,
  FlaskConical,
  LineChart,
  ClipboardCheck,
  BrainCircuit,
  Database,
  BookOpen,
  Menu,
  X,
  Sun,
  Moon,
  Smartphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const { session } = useApp();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Overview', href: '/', icon: Activity },
    { label: 'Experiments', href: '/experiments', icon: FlaskConical },
    { label: 'Samples', href: '/samples', icon: Layers },
    { label: 'Sensor Graphs', href: '/sensor', icon: LineChart },
    { label: 'Assessment', href: '/assess', icon: ClipboardCheck },
    { label: 'AI Status', href: '/ai', icon: BrainCircuit },
    { label: 'Data & Backup', href: '/backup', icon: Database },
    { label: 'Docs', href: '/guide', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-[1px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/30 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center text-cyan-400">
                <Activity className="w-5 h-5 transition-transform group-hover:scale-110" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-slate-100">
                  NoseNet
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-cyan-400 uppercase bg-cyan-950/80 px-1.5 py-0.2 rounded border border-cyan-800/60">
                  IoT v1.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-tight hidden sm:block">
                Cake Freshness & Adulteration Platform
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    isActive
                      ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700/80'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  )}
                >
                  <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-cyan-400' : 'text-slate-400')} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2.5">
          {/* Quick link to Mobile Assessor view */}
          <Link
            href="/assess"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-cyan-950/50 hover:bg-cyan-900/50 text-cyan-300 border border-cyan-800/40 transition-colors"
            title="Mobile Assessor Terminal"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Assessor Terminal</span>
          </Link>

          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>

          {/* Role pill badge */}
          {session && (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 transition-colors"
              title="Click to switch role or sign in as different user"
            >
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  session.role === 'researcher' ? 'bg-cyan-400' : 'bg-amber-400'
                )}
              />
              <span className="capitalize font-medium text-slate-200">{session.role}</span>
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
            aria-label="Open mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-slate-950 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-slate-800 text-cyan-300 border border-slate-700/80'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-cyan-400' : 'text-slate-400')} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-800/80 mt-2 flex items-center justify-between">
            <span className="text-xs text-slate-400">Assessor Phone View</span>
            <Link
              href="/assess"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-cyan-400 font-medium"
            >
              Open Mobile Assessment →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

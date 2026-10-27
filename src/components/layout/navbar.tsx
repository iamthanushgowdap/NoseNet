'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/app-context';
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
  Smartphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const { session } = useApp();
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
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold">
              <Activity className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">
                  NoseNet
                </span>
                <span className="text-[10px] font-mono uppercase bg-neutral-900 text-white px-1.5 py-0.5 rounded border border-neutral-700">
                  IoT v1.0
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 tracking-tight hidden sm:block">
                Cake Freshness & Adulteration Detection
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
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-neutral-900 text-white border border-neutral-700 font-semibold'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                  )}
                >
                  <Icon className="w-3.5 h-3.5 text-white" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2.5">
          {/* Quick link to Mobile Assessor terminal */}
          <Link
            href="/assess"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 transition-colors"
            title="Mobile Assessor Terminal"
          >
            <Smartphone className="w-3.5 h-3.5 text-white" />
            <span>Assessor Terminal</span>
          </Link>

          {/* Role pill badge */}
          {session && (
            <Link
              href="/login"
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs bg-black border border-neutral-800 text-white hover:border-neutral-600 transition-colors"
              title="Click to switch role or sign in as different user"
            >
              <div className="w-2 h-2 rounded-full bg-white" />
              <span className="capitalize font-medium text-white">{session.role}</span>
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-md text-white hover:bg-neutral-900 transition-colors"
            aria-label="Open mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-neutral-800 bg-black px-4 pt-2 pb-4 space-y-1">
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
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-neutral-900 text-white border border-neutral-700'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                )}
              >
                <Icon className="w-4 h-4 text-white" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-3 border-t border-neutral-800 mt-2 flex items-center justify-between">
            <span className="text-xs text-neutral-400">Assessor Phone View</span>
            <Link
              href="/assess"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-white font-bold underline"
            >
              Open Mobile Assessment →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

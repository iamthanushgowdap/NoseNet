'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ className = '', showLabel = true }: { className?: string; showLabel?: boolean }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('nosenet_theme');
      if (saved === 'dark') {
        setTheme('dark');
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        setTheme('light');
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      }
    } catch {
      // Default to light
      setTheme('light');
    }
  }, []);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);

    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(nextTheme);
    root.setAttribute('data-theme', nextTheme);

    try {
      localStorage.setItem('nosenet_theme', nextTheme);
    } catch {
      // Storage unavailable
    }
  };

  if (!mounted) {
    return (
      <div className={`w-8 h-8 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 ${className}`} />
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition cursor-pointer select-none active:scale-95 shrink-0 ${
        theme === 'dark'
          ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
          : 'bg-neutral-100 border-neutral-300 text-neutral-700 hover:text-black hover:border-neutral-400 shadow-xs'
      } ${className}`}
      title={`Switch to ${theme === 'dark' ? 'White (Light)' : 'Black (Dark)'} Theme`}
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? (
        <>
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          {showLabel && <span className="hidden sm:inline font-semibold">Light</span>}
        </>
      ) : (
        <>
          <Moon className="w-3.5 h-3.5 text-neutral-700" />
          {showLabel && <span className="hidden sm:inline font-semibold">Dark</span>}
        </>
      )}
    </button>
  );
}

export default ThemeToggle;

'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Lock, User, ArrowRight, ShieldCheck, Sparkles, KeyRound } from 'lucide-react';
import { AssessorPinModal } from './assessor-pin-modal';

interface SplashLoginProps {
  onSuccess: () => void;
}

export function SplashLogin({ onSuccess }: SplashLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSplashAnimation, setShowSplashAnimation] = useState(true);

  // Secret 10-tap easter egg state
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [showAssessorModal, setShowAssessorModal] = useState(false);

  useEffect(() => {
    // Show splash animation for 1.2s on first load
    const timer = setTimeout(() => {
      setShowSplashAnimation(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleLogoTap = () => {
    const now = Date.now();
    let currentTaps = tapCount;

    if (now - lastTapTime > 3000) {
      currentTaps = 1;
    } else {
      currentTaps += 1;
    }

    setLastTapTime(now);
    setTapCount(currentTaps);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(20);
    }

    if (currentTaps >= 10) {
      setTapCount(0);
      setShowAssessorModal(true);
    }
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    // Verify Admin credentials
    const isUserValid = cleanUser === 'admin' || cleanUser === 'nosenet';
    const isPassValid = cleanPass === '12345';

    if (isUserValid && isPassValid) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('nosenet_admin_auth', 'true');
      }
      setTimeout(() => {
        setIsSubmitting(false);
        onSuccess();
      }, 300);
    } else {
      setIsSubmitting(false);
      setError('Invalid credentials. Use Login ID: admin and Password: 12345');
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    }
  };

  const handleQuickFill = () => {
    setUsername('admin');
    setPassword('12345');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black text-white select-none overflow-y-auto">
      {/* 1. Initial Splash Animation Phase */}
      {showSplashAnimation ? (
        <div className="flex flex-col items-center justify-center space-y-6 animate-pulse">
          <div className="w-20 h-20 rounded-3xl bg-white text-black flex items-center justify-center shadow-2xl scale-105 transition">
            <Activity className="w-10 h-10 text-black animate-spin" />
          </div>
          <div className="text-center space-y-1.5">
            <h1 className="text-3xl font-black tracking-tight text-white">NoseNet</h1>
            <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">
              Electronic Nose System Initializing...
            </p>
          </div>
          <div className="w-48 h-1 bg-neutral-900 rounded-full overflow-hidden">
            <div className="h-full bg-white animate-pulse w-3/4 rounded-full" />
          </div>
        </div>
      ) : (
        /* 2. Admin Authentication Form */
        <div className="w-full max-w-sm rounded-3xl border border-neutral-800 bg-neutral-950 p-6 sm:p-8 space-y-6 shadow-2xl">
          {/* Logo with Secret 10-Tap Trigger */}
          <div className="flex flex-col items-center text-center space-y-3">
            <button
              type="button"
              onClick={handleLogoTap}
              className="w-16 h-16 rounded-2xl bg-white text-black flex items-center justify-center shadow-lg active:scale-95 transition cursor-pointer relative group"
              title="NoseNet Station"
            >
              <Activity className="w-8 h-8 text-black" />
              {tapCount > 3 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-neutral-900 text-white border border-neutral-700 text-[10px] font-mono flex items-center justify-center font-bold">
                  {tapCount}
                </span>
              )}
            </button>

            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">NoseNet Station</h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                IoT Cake Freshness & Adulteration Platform
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase text-neutral-400 block font-semibold">
                Login ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                  autoCapitalize="none"
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm focus:border-white transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase text-neutral-400 block font-semibold">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="12345"
                  required
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm focus:border-white transition"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-mono">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-white text-black font-extrabold text-sm hover:bg-neutral-200 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Verifying...' : 'Access Station'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Helper */}
          <div className="pt-2 border-t border-neutral-900 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
            <span>College Demo Mode</span>
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-neutral-400 hover:text-white underline underline-offset-2 transition"
            >
              Auto-Fill (admin / 12345)
            </button>
          </div>
        </div>
      )}

      {/* Secret Assessor PIN Modal (Activated by 10 taps) */}
      <AssessorPinModal
        isOpen={showAssessorModal}
        onClose={() => setShowAssessorModal(false)}
      />
    </div>
  );
}

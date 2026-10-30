'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Lock } from 'lucide-react';
import { AssessorPinModal } from '@/components/auth/assessor-pin-modal';

export function Navbar() {
  const pathname = usePathname();

  // Secret 10-tap easter egg state
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [showPinModal, setShowPinModal] = useState(false);

  // If on hidden assessor screen, completely hide the navbar for 100% native phone feel
  if (pathname === '/assessor') {
    return null;
  }

  const handleLogoTap = (e: React.MouseEvent) => {
    // Prevent default link navigation if rapidly tapping
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
      e.preventDefault();
      setTapCount(0);
      setShowPinModal(true);
    }
  };

  const handleLockStation = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nosenet_admin_auth');
      window.location.reload();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-black text-white select-none">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Brand with 10-Tap Trigger */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleLogoTap}
              className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold active:scale-90 transition cursor-pointer relative shrink-0"
              title="NoseNet Station"
            >
              <Activity className="w-5 h-5 text-black" />
              {tapCount > 3 && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-neutral-900 text-white border border-neutral-700 text-[9px] font-mono flex items-center justify-center font-bold">
                  {tapCount}
                </span>
              )}
            </button>

            <Link href="/" className="flex flex-col">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  NoseNet
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono uppercase bg-neutral-900 text-neutral-300 px-1.5 py-0.5 rounded border border-neutral-700">
                  ESP32 • BME688
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 tracking-tight hidden sm:block">
                IoT-Based Cake Freshness & Adulteration Detection
              </p>
            </Link>
          </div>

          {/* Right Status Badge & Lock Control */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono px-2.5 sm:px-3 py-1 rounded-full bg-neutral-900 text-neutral-300 border border-neutral-800 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden xs:inline">Hardware</span> Monitoring Station
            </span>

            {/* Lock / Log Out Button */}
            <button
              onClick={handleLockStation}
              className="p-1.5 sm:p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer shrink-0"
              title="Lock Station"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Secret Assessor PIN Modal */}
      <AssessorPinModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
      />
    </>
  );
}

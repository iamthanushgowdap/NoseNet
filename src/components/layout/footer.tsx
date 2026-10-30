'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();

  // Hide footer completely on assessor mobile screen
  if (pathname === '/assessor') {
    return null;
  }

  return (
    <footer className="w-full border-t border-neutral-800 bg-black py-6 px-4 sm:px-6 lg:px-8 text-xs text-neutral-400">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div>
          <p className="font-semibold text-white">
            NoseNet — IoT-Based Cake Freshness and Adulteration Detection Device
          </p>
          <p className="mt-1 text-[11px] text-neutral-500">
            College Capstone Project • ESP32 & SmartElex BME688 MOX Gas Sensor
          </p>
        </div>
        <div className="text-[11px] font-mono text-neutral-500">
          Hardware Testing Station
        </div>
      </div>
    </footer>
  );
}

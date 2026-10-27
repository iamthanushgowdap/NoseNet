import React from 'react';
import Link from 'next/link';
import { Cpu, HardDrive, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-neutral-800 bg-black py-8 px-4 sm:px-6 lg:px-8 text-xs text-white">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-white">
            NoseNet — IoT-Based Cake Freshness and Adulteration Detection Device
          </p>
          <p className="mt-1 text-neutral-400 text-[11px]">
            College Project • Local-First Architecture • ESP32 & Metal Oxide Gas Sensor Platform
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5 text-white">
            <Cpu className="w-3.5 h-3.5 text-white" />
            <span>ESP32 Ready</span>
          </div>
          <div className="flex items-center gap-1.5 text-white">
            <HardDrive className="w-3.5 h-3.5 text-white" />
            <span>Local Browser Storage</span>
          </div>
          <div className="flex items-center gap-1.5 text-white">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
            <span>Zod Validated</span>
          </div>
          <Link href="/guide" className="text-white hover:text-neutral-300 underline underline-offset-2">
            Technical Documentation
          </Link>
        </div>
      </div>
    </footer>
  );
}

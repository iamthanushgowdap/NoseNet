import React from 'react';
import Link from 'next/link';
import { Cpu, HardDrive, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-800 bg-slate-950/60 mt-auto py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-medium text-slate-300">
            NoseNet — IoT-Based Cake Freshness and Adulteration Detection Device
          </p>
          <p className="mt-1 text-slate-500 text-[11px]">
            College Capstone Project • Local-First Architecture • ESP32 & Metal Oxide Gas Sensor Headspace Analyzer
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>ESP32 Ready</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
            <span>Local-First (No Cloud DB)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Zod Validated</span>
          </div>
          <Link href="/guide" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">
            Technical Specs & FAQ
          </Link>
        </div>
      </div>
    </footer>
  );
}

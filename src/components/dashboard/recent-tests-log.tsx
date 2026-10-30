'use client';

import React, { useState } from 'react';
import { History, ChevronDown, ChevronUp, Trash2, CheckCircle2, Clock, Thermometer, Flame } from 'lucide-react';
import { CakeType, FreshnessVerdict } from '@/lib/server/live-test-store';

export interface RecentTestItem {
  id: string;
  cakeType: CakeType;
  timestamp: string;
  gasKohm: number;
  tempC: number;
  humidity: number;
  verdict: FreshnessVerdict;
  score?: number;
}

interface RecentTestsLogProps {
  tests: RecentTestItem[];
  onClear: () => void;
}

export function RecentTestsLog({ tests, onClear }: RecentTestsLogProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!tests || tests.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 sm:p-6 space-y-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-left group cursor-pointer"
        >
          <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs">
            <History className="w-3 h-3 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Recent Specimen Test Log
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-900 text-neutral-300 border border-neutral-800">
                {tests.length} Recorded
              </span>
            </div>
          </div>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-neutral-500 group-hover:text-white transition" />
          ) : (
            <ChevronDown className="w-4 h-4 text-neutral-500 group-hover:text-white transition" />
          )}
        </button>

        <button
          onClick={onClear}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-400 hover:text-rose-400 hover:border-rose-900/50 transition cursor-pointer"
          title="Clear session history"
        >
          <Trash2 className="w-3 h-3" />
          <span className="hidden sm:inline">Clear Log</span>
        </button>
      </div>

      {isOpen && (
        <div className="pt-1 space-y-3">
          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500 uppercase text-[10px]">
                  <th className="pb-2.5 font-semibold">Test ID</th>
                  <th className="pb-2.5 font-semibold">Specimen Type</th>
                  <th className="pb-2.5 font-semibold">Timestamp</th>
                  <th className="pb-2.5 font-semibold">Sensor Metrics</th>
                  <th className="pb-2.5 font-semibold text-right">Official Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900">
                {tests.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-900/40 transition">
                    <td className="py-3 text-neutral-400">{item.id}</td>
                    <td className="py-3 text-white font-bold">{item.cakeType}</td>
                    <td className="py-3 text-neutral-400">{item.timestamp}</td>
                    <td className="py-3 text-neutral-300">
                      R_gas: <span className="text-white font-bold">{item.gasKohm.toFixed(2)} kΩ</span> •{' '}
                      {item.tempC.toFixed(1)}°C
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] uppercase ${
                          item.verdict === 'Fresh'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                            : item.verdict === 'Fairly Fresh'
                            ? 'bg-amber-950 text-amber-300 border border-amber-700'
                            : item.verdict === 'Stale'
                            ? 'bg-orange-950 text-orange-300 border border-orange-700'
                            : 'bg-rose-950 text-rose-300 border border-rose-700'
                        }`}
                      >
                        <span>{item.verdict}</span>
                        {item.score !== undefined && (
                          <span className="opacity-80 font-mono text-[10px]">({item.score}%)</span>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Stack */}
          <div className="sm:hidden space-y-2.5">
            {tests.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-black border border-neutral-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-sm">{item.cakeType}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      item.verdict === 'Fresh'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : item.verdict === 'Fairly Fresh'
                        ? 'bg-amber-950 text-amber-300 border border-amber-700'
                        : item.verdict === 'Stale'
                        ? 'bg-orange-950 text-orange-300 border border-orange-700'
                        : 'bg-rose-950 text-rose-300 border border-rose-700'
                    }`}
                  >
                    {item.verdict} {item.score !== undefined ? `(${item.score}%)` : ''}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-1 border-t border-neutral-900">
                  <span>{item.id}</span>
                  <span>{item.timestamp}</span>
                </div>

                <div className="text-[11px] font-mono text-neutral-300">
                  R_gas: <strong className="text-white">{item.gasKohm.toFixed(2)} kΩ</strong> • {item.tempC.toFixed(1)}°C • {item.humidity.toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  X,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
  Clock,
  Thermometer,
  Droplets,
  Layers,
  Sparkles,
} from 'lucide-react';
import { LONGITUDINAL_DATASET as datasetData } from '@/lib/data/longitudinal-dataset';

interface LongitudinalDatasetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LongitudinalDatasetModal({ isOpen, onClose }: LongitudinalDatasetModalProps) {
  const [selectedCakeFilter, setSelectedCakeFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (!isOpen) return null;

  const cakeTypes = [
    'All',
    'Normal Cake — Unfrozen',
    'Normal Cake — Frozen',
    'Pastry Cake — Unfrozen',
    'Pastry Cake — Frozen',
  ];

  const filteredData = datasetData.filter((row: any) => {
    const matchesCake = selectedCakeFilter === 'All' || row.type === selectedCakeFilter;
    const matchesSearch =
      searchTerm === '' ||
      row.interval.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.verdict.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCake && matchesSearch;
  });

  const handleDownloadCsv = () => {
    window.location.href = '/api/dataset';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-800 flex items-center justify-between bg-black/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-bold shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-white">
                  7-Day Longitudinal Experimental Dataset
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold">
                  52 Data Points
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                BME688 MOX gas sensor readings across all 4 cake configurations (0h to 168h).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCsv}
              className="px-3.5 py-2 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-neutral-200 transition flex items-center gap-2 cursor-pointer shadow"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 border-b border-neutral-800/80 bg-neutral-950 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          {/* Cake Type Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {cakeTypes.map((ct) => (
              <button
                key={ct}
                onClick={() => setSelectedCakeFilter(ct)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedCakeFilter === ct
                    ? 'bg-white text-black shadow'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                {ct}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search interval, notes, verdict..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white font-mono"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-4">
          <div className="rounded-xl border border-neutral-800 overflow-hidden">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-neutral-900/90 text-neutral-400 border-b border-neutral-800 uppercase text-[10px] tracking-wider">
                  <th className="p-3">ID / Interval</th>
                  <th className="p-3">Specimen Type</th>
                  <th className="p-3">Date &amp; Time</th>
                  <th className="p-3">Temp</th>
                  <th className="p-3">Hum</th>
                  <th className="p-3">R_gas (kΩ)</th>
                  <th className="p-3">ΔR / R₀</th>
                  <th className="p-3">Verdict</th>
                  <th className="p-3">Index</th>
                  <th className="p-3 min-w-[280px]">Organoleptic Observations</th>
                  <th className="p-3">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 bg-black/60">
                {filteredData.map((row: any) => {
                  const delta = Number(
                    (((row.gas_kohm - row.r0_kohm) / row.r0_kohm) * 100).toFixed(1)
                  );
                  const isHardware = row.source.includes('Hardware');

                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-neutral-900/40 transition ${
                        isHardware ? 'bg-cyan-950/10' : ''
                      }`}
                    >
                      <td className="p-3 whitespace-nowrap">
                        <div className="font-bold text-white">{row.interval}</div>
                        <div className="text-[10px] text-neutral-500">{row.id}</div>
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        <div className="text-neutral-200 font-semibold">{row.type}</div>
                        <div className="text-[10px] text-neutral-500">{row.cat}</div>
                      </td>

                      <td className="p-3 whitespace-nowrap text-neutral-400 text-[11px]">
                        <div>{row.date}</div>
                        <div className="text-[10px] text-neutral-500">{row.time}</div>
                      </td>

                      <td className="p-3 whitespace-nowrap text-white tabular-nums">
                        {row.temp.toFixed(1)}°C
                      </td>

                      <td className="p-3 whitespace-nowrap text-white tabular-nums">
                        {row.hum.toFixed(0)}%
                      </td>

                      <td className="p-3 whitespace-nowrap font-bold text-white tabular-nums">
                        {row.gas_kohm.toFixed(2)}{' '}
                        <span className="text-[10px] text-neutral-500 font-normal">kΩ</span>
                      </td>

                      <td className="p-3 whitespace-nowrap tabular-nums">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            delta >= 0
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                              : 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                          }`}
                        >
                          {delta >= 0 ? `+${delta}` : delta}%
                        </span>
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            row.verdict === 'Fresh'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : row.verdict === 'Fairly Fresh'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : row.verdict === 'Stale'
                              ? 'bg-orange-950 text-orange-300 border border-orange-800'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}
                        >
                          {row.verdict}
                        </span>
                      </td>

                      <td className="p-3 whitespace-nowrap font-black text-white tabular-nums">
                        {row.score.toFixed(1)}%
                      </td>

                      <td className="p-3 text-neutral-300 text-[11px] leading-relaxed">
                        {row.notes}
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider ${
                            isHardware
                              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold'
                              : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                          }`}
                        >
                          {isHardware ? 'Hardware Measured' : 'Empirical Model'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-neutral-800 bg-black/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400 shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              Rows anchored directly to physical hardware test runs{' '}
              <strong className="text-white">CAKE_EXP_001, CAKE_EXP_002, CAKE_EXP_003</strong>.
            </span>
          </div>

          <button
            onClick={handleDownloadCsv}
            className="px-4 py-2 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-neutral-200 transition flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download NoseNet-7Day-Complete-Experimental-Readings.csv</span>
          </button>
        </div>
      </div>
    </div>
  );
}

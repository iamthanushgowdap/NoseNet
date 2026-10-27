import React from 'react';
import Link from 'next/link';
import { BrainCircuit, ArrowUpRight } from 'lucide-react';
import { AIReadinessMetrics } from '@/types/ai';

export function AIStatusBanner({ metrics }: { metrics: AIReadinessMetrics }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/20 p-5 sm:p-6 mb-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-cyan-400 shrink-0 mt-0.5">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-slate-100">
                Machine Learning Inference Status:
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-amber-400 border border-amber-500/30">
                {metrics.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {metrics.statusMessage}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-slate-300">
              {metrics.pairedSamplesCount} / {metrics.minimumRequiredForTraining} Samples
            </div>
            <div className="text-[10px] text-slate-500">Paired Sensor + Sensory Data</div>
          </div>

          <Link
            href="/ai"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
          >
            <span>Model Details</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}

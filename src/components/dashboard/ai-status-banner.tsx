import React from 'react';
import Link from 'next/link';
import { BrainCircuit, ArrowUpRight } from 'lucide-react';
import { AIReadinessMetrics } from '@/types/ai';

export function AIStatusBanner({ metrics }: { metrics: AIReadinessMetrics }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-black p-5 sm:p-6 mb-8 text-white">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-700 text-white shrink-0 mt-0.5">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-white">
                Machine Learning Status:
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-neutral-900 text-white border border-neutral-700 uppercase">
                {metrics.status}
              </span>
            </div>
            <p className="text-xs text-neutral-300 mt-1 max-w-2xl leading-relaxed">
              {metrics.statusMessage}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-white">
              {metrics.pairedSamplesCount} / {metrics.minimumRequiredForTraining} Samples
            </div>
            <div className="text-[10px] text-neutral-400">Paired Sensor + Sensory Records</div>
          </div>

          <Link
            href="/ai"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 transition-colors"
          >
            <span>Model Details</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-white" />
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { services } from '@/services';
import { AIModelStatus, AIReadinessMetrics } from '@/types/ai';
import {
  BrainCircuit,
  ShieldAlert,
  AlertOctagon,
  Scale,
  Microscope,
} from 'lucide-react';

export default function AIStatusPage() {
  const [metrics, setMetrics] = useState<AIReadinessMetrics | null>(null);
  const [demoStateOverride, setDemoStateOverride] = useState<AIModelStatus | null>(null);

  useEffect(() => {
    async function loadMetrics() {
      const data = await services.ai.getReadinessMetrics();
      setMetrics(data);
    }
    loadMetrics();
  }, []);

  const activeStatus: AIModelStatus = demoStateOverride || (metrics?.status ?? 'Not Configured');

  const scientificPrinciples = services.ai.getScientificPrinciples();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 bg-black text-white">
      {/* Top Header */}
      <div className="pb-6 border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <BrainCircuit className="w-6 h-6 text-white" />
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Machine Learning & Inference Status
          </h1>
        </div>
        <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
          AI-based classification pipeline specification, training dataset readiness criteria, and academic validation protocols.
        </p>
      </div>

      {/* Main Status Display Banner */}
      <div className="rounded-lg border border-neutral-800 bg-black p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-neutral-700 text-white flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Current Pipeline Status:
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-neutral-900 text-white border border-neutral-700">
                  {activeStatus}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                AI prediction unavailable — insufficient validated data
              </h2>
            </div>
          </div>

          {/* Test State Inspector for College Reviewers */}
          <div className="self-end sm:self-auto text-right">
            <span className="text-[10px] text-neutral-400 block mb-1">
              Inspect Status State:
            </span>
            <select
              value={activeStatus}
              onChange={(e) => setDemoStateOverride(e.target.value as AIModelStatus)}
              className="text-xs px-2.5 py-1 rounded-lg bg-black border border-neutral-800 text-white focus:outline-none focus:border-white"
            >
              <option value="Not Configured" className="bg-black text-white">Not Configured</option>
              <option value="Not Validated" className="bg-black text-white">Not Validated</option>
              <option value="Ready for Validation" className="bg-black text-white">Ready for Validation</option>
              <option value="Validated and Enabled" className="bg-black text-white">Validated and Enabled</option>
              <option value="Unavailable" className="bg-black text-white">Unavailable</option>
            </select>
          </div>
        </div>

        {/* Explicit Explanation */}
        <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 space-y-2 leading-relaxed">
          <p className="font-semibold text-white flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 shrink-0 text-white" />
            <span>Strict Academic Transparency Mandate:</span>
          </p>
          <p>
            In accordance with sound engineering practice, NoseNet does not invent fake freshness probabilities,
            simulated neural network weights, or artificial precision/recall scores. Automated spoilage inference
            is intentionally disabled until a real classification model (e.g., PCA + Random Forest or SVM) is trained
            on calibrated multi-channel electronic nose datasets and cross-validated against independent sensory panels.
          </p>
        </div>

        {/* Dataset Readiness Counters */}
        {metrics && (
          <div>
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
              Training Dataset Readiness Metrics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-400 text-[11px] block">Total Registered Samples</span>
                <span className="text-xl font-bold text-white mt-1 block">
                  {metrics.totalSamples}
                </span>
              </div>
              <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-400 text-[11px] block">Samples with Sensory Labels</span>
                <span className="text-xl font-bold text-white mt-1 block">
                  {metrics.labeledSamples}
                </span>
              </div>
              <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-400 text-[11px] block">Sensor Readings Recorded</span>
                <span className="text-xl font-bold text-white mt-1 block">
                  {metrics.sensorReadingsCount.toLocaleString()}
                </span>
              </div>
              <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800">
                <span className="text-white text-[11px] block font-semibold">Paired Training Specimen</span>
                <span className="text-xl font-bold text-white mt-1 block">
                  {metrics.pairedSamplesCount} / {metrics.minimumRequiredForTraining}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                <span>Dataset Collection Progress</span>
                <span className="text-white font-mono">
                  {Math.min(
                    100,
                    Math.round((metrics.pairedSamplesCount / metrics.minimumRequiredForTraining) * 100)
                  )}
                  %
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-neutral-950 border border-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      (metrics.pairedSamplesCount / metrics.minimumRequiredForTraining) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scientific Principles Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Microscope className="w-4 h-4 text-white" />
          <span>Scientific Grounding & Gas Sensor Fundamentals</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scientificPrinciples.map((p, i) => (
            <div
              key={i}
              className="p-5 rounded-lg bg-black border border-neutral-800 text-xs space-y-2"
            >
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-white" />
                <span>{p.title}</span>
              </h4>
              <p className="text-neutral-400 leading-relaxed">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

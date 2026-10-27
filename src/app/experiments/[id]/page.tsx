'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/app-context';
import { services } from '@/services';
import { Experiment } from '@/types/experiment';
import { Sample } from '@/types/sample';
import { ExperimentFormModal } from '@/components/experiments/experiment-form-modal';
import { StatusBadge } from '@/components/common/badge';
import { Button } from '@/components/common/button';
import { formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  Edit2,
  Layers,
  LineChart,
  CheckCircle2,
  Clock,
  Calendar,
  FileText,
  Plus,
} from 'lucide-react';

function ExperimentDetailContent({ id }: { id: string }) {
  const { refreshData } = useApp();

  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const exp = await services.experiments.getExperimentById(id);
        if (exp) {
          setExperiment(exp);
          const smps = await services.samples.getSamples(exp.id);
          setSamples(smps);
        }
      } catch (e) {
        console.error('Failed to load experiment details:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleUpdateSuccess = async () => {
    await refreshData();
    const exp = await services.experiments.getExperimentById(id);
    if (exp) {
      setExperiment(exp);
      const smps = await services.samples.getSamples(exp.id);
      setSamples(smps);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        Loading experiment details...
      </div>
    );
  }

  if (!experiment) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-lg font-semibold text-slate-200">Experiment Not Found</h2>
        <p className="text-xs text-slate-400 mt-1 mb-4">
          No experiment exists with ID &quot;{id}&quot;.
        </p>
        <Link href="/experiments">
          <Button variant="secondary" size="sm">
            Back to Experiments
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Back button */}
      <div className="mb-4">
        <Link
          href="/experiments"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Experiments</span>
        </Link>
      </div>

      {/* Main Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-sm font-bold text-cyan-400">
                {experiment.id}
              </span>
              <StatusBadge status={experiment.status} />
              <span className="text-xs text-slate-500 font-mono">
                Created {formatDate(experiment.createdAt)}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 mt-2">
              {experiment.name}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/sensor?experimentId=${experiment.id}`}>
              <Button variant="outline" size="sm">
                <LineChart className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                View Sensor Graphs
              </Button>
            </Link>
            <Button variant="secondary" size="sm" onClick={() => setIsEditModalOpen(true)}>
              <Edit2 className="w-3.5 h-3.5 mr-1" />
              Edit Experiment
            </Button>
          </div>
        </div>

        {/* Metadata info grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
          <div>
            <span className="text-slate-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Test Date
            </span>
            <span className="font-medium text-slate-200 mt-0.5 block">
              {experiment.testDate}
            </span>
          </div>
          <div>
            <span className="text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Planned Duration
            </span>
            <span className="font-medium text-slate-200 mt-0.5 block">
              {experiment.plannedDurationMinutes} minutes
            </span>
          </div>
          <div>
            <span className="text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Actual Duration
            </span>
            <span className="font-medium text-slate-200 mt-0.5 block">
              {experiment.actualDurationMinutes ? `${experiment.actualDurationMinutes} mins` : '—'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 flex items-center gap-1">
              <Layers className="w-3 h-3" /> Total Samples
            </span>
            <span className="font-medium text-slate-200 mt-0.5 block">
              {samples.length} registered
            </span>
          </div>
        </div>

        {experiment.description && (
          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Description & Objectives
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">{experiment.description}</p>
          </div>
        )}

        {experiment.protocolNotes && (
          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Protocol Notes & Sensor Settings</span>
            </h4>
            <p className="text-xs font-mono text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800/80 leading-relaxed whitespace-pre-wrap">
              {experiment.protocolNotes}
            </p>
          </div>
        )}
      </div>

      {/* Control Runs Baseline Verification Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Control Runs & Reference Baselines</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Pre-test baselines required for temperature/humidity compensation and drift calibration.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ROOM Stage Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                1. ROOM Control Run
              </span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  experiment.controls.roomStageCompleted
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {experiment.controls.roomStageCompleted ? 'Verified' : 'Pending'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Measures ambient air before placing cake inside chamber.
            </p>
            {experiment.controls.roomBaselineResistanceKohm && (
              <div className="mt-3 text-xs font-mono text-cyan-400">
                Baseline Gas Resistance: {experiment.controls.roomBaselineResistanceKohm} kΩ
              </div>
            )}
          </div>

          {/* EMPTY_CONTAINER Stage Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                2. EMPTY_CONTAINER Control Run
              </span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  experiment.controls.emptyContainerStageCompleted
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {experiment.controls.emptyContainerStageCompleted ? 'Verified' : 'Pending'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Ensures zero volatile contamination or residual alcohol inside testing chamber.
            </p>
            {experiment.controls.emptyContainerBaselineResistanceKohm && (
              <div className="mt-3 text-xs font-mono text-cyan-400">
                Baseline Gas Resistance: {experiment.controls.emptyContainerBaselineResistanceKohm} kΩ
              </div>
            )}
          </div>
        </div>

        {experiment.controls.notes && (
          <div className="mt-4 text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
            <strong>Control Run Notes:</strong> {experiment.controls.notes}
          </div>
        )}
      </div>

      {/* Associated Samples Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Registered Samples ({samples.length})
            </h3>
          </div>
          <Link href={`/samples?experimentId=${experiment.id}`}>
            <Button variant="primary" size="sm">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Register Sample for this Experiment
            </Button>
          </Link>
        </div>

        {samples.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No cake samples registered for this experiment yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/80 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Sample ID</th>
                  <th className="py-2.5 px-3">Cake Category</th>
                  <th className="py-2.5 px-3">Storage Condition</th>
                  <th className="py-2.5 px-3">Replicate</th>
                  <th className="py-2.5 px-3">Test Status</th>
                  <th className="py-2.5 px-3">Mass (g)</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {samples.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-cyan-400">{s.id}</td>
                    <td className="py-2.5 px-3 text-slate-200">{s.category}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] ${
                          s.storageCondition === 'Frozen'
                            ? 'bg-cyan-500/10 text-cyan-300'
                            : 'bg-amber-500/10 text-amber-300'
                        }`}
                      >
                        {s.storageCondition}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{s.replicateNumber}</td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {s.massGrams ? `${s.massGrams} g` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-2">
                      <Link
                        href={`/assess?sampleId=${s.id}`}
                        className="text-cyan-400 hover:text-cyan-300 font-medium"
                      >
                        Assess
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Experiment Modal */}
      <ExperimentFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleUpdateSuccess}
        initialData={experiment}
      />
    </div>
  );
}

function ExperimentDetailInner({ params }: { params: Promise<{ id: string }> }) {
  const resolved = use(params);
  return <ExperimentDetailContent id={resolved.id} />;
}

export default function ExperimentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading experiment...</div>}>
      <ExperimentDetailInner params={params} />
    </Suspense>
  );
}

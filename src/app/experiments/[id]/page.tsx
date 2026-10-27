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
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-white">
        Loading experiment details...
      </div>
    );
  }

  if (!experiment) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-white">
        <h2 className="text-lg font-bold text-white">Experiment Not Found</h2>
        <p className="text-xs text-neutral-300 mt-1 mb-4">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full bg-black text-white space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/experiments"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Experiments</span>
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="bg-black border border-neutral-800 rounded-xl p-6 text-white space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-sm font-bold text-white">
                {experiment.id}
              </span>
              <StatusBadge status={experiment.status} />
              <span className="text-xs text-neutral-400 font-mono">
                Created {formatDate(experiment.createdAt)}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mt-2">
              {experiment.name}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/sensor?experimentId=${experiment.id}`}>
              <Button variant="outline" size="sm">
                <LineChart className="w-3.5 h-3.5 mr-1 text-white" />
                View Sensor Graphs
              </Button>
            </Link>
            <Button variant="secondary" size="sm" onClick={() => setIsEditModalOpen(true)}>
              <Edit2 className="w-3.5 h-3.5 mr-1" />
              Edit Experiment
            </Button>
          </div>
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1 text-xs">
          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
            <span className="text-neutral-400 flex items-center gap-1 text-[11px] uppercase font-bold">
              <Calendar className="w-3 h-3 text-white" /> Test Date
            </span>
            <span className="font-bold text-white mt-1 block text-sm">
              {experiment.testDate}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
            <span className="text-neutral-400 flex items-center gap-1 text-[11px] uppercase font-bold">
              <Clock className="w-3 h-3 text-white" /> Planned Duration
            </span>
            <span className="font-bold text-white mt-1 block text-sm">
              {experiment.plannedDurationMinutes} mins
            </span>
          </div>
          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
            <span className="text-neutral-400 flex items-center gap-1 text-[11px] uppercase font-bold">
              <Clock className="w-3 h-3 text-white" /> Actual Duration
            </span>
            <span className="font-bold text-white mt-1 block text-sm">
              {experiment.actualDurationMinutes ? `${experiment.actualDurationMinutes} mins` : '—'}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
            <span className="text-neutral-400 flex items-center gap-1 text-[11px] uppercase font-bold">
              <Layers className="w-3 h-3 text-white" /> Total Samples
            </span>
            <span className="font-bold text-white mt-1 block text-sm">
              {samples.length} registered
            </span>
          </div>
        </div>

        {experiment.description && (
          <div className="pt-2">
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">
              Description & Objectives
            </h4>
            <p className="text-xs text-white leading-relaxed">{experiment.description}</p>
          </div>
        )}

        {experiment.protocolNotes && (
          <div className="pt-2">
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-white" />
              <span>Protocol Notes & Sensor Settings</span>
            </h4>
            <p className="text-xs font-mono text-white bg-neutral-950 p-3 rounded-lg border border-neutral-800 leading-relaxed whitespace-pre-wrap">
              {experiment.protocolNotes}
            </p>
          </div>
        )}
      </div>

      {/* Control Runs Baseline Verification Card */}
      <div className="bg-black border border-neutral-800 rounded-xl p-6 text-white space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Control Runs & Reference Baselines</span>
            </h3>
            <p className="text-xs text-neutral-300 mt-0.5">
              Pre-test baselines required for temperature/humidity compensation and drift calibration.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ROOM Stage Card */}
          <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                1. ROOM Control Run
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                  experiment.controls.roomStageCompleted
                    ? 'bg-neutral-900 text-white border border-white'
                    : 'bg-neutral-900 text-neutral-400 border border-neutral-700'
                }`}
              >
                {experiment.controls.roomStageCompleted ? 'Verified' : 'Pending'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-300 mt-1">
              Measures ambient air before placing cake inside chamber.
            </p>
            {experiment.controls.roomBaselineResistanceKohm && (
              <div className="mt-3 text-xs font-mono text-white font-bold">
                Baseline Gas Resistance: {experiment.controls.roomBaselineResistanceKohm} kΩ
              </div>
            )}
          </div>

          {/* EMPTY_CONTAINER Stage Card */}
          <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                2. EMPTY_CONTAINER Control Run
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                  experiment.controls.emptyContainerStageCompleted
                    ? 'bg-neutral-900 text-white border border-white'
                    : 'bg-neutral-900 text-neutral-400 border border-neutral-700'
                }`}
              >
                {experiment.controls.emptyContainerStageCompleted ? 'Verified' : 'Pending'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-300 mt-1">
              Ensures zero volatile contamination inside testing chamber.
            </p>
            {experiment.controls.emptyContainerBaselineResistanceKohm && (
              <div className="mt-3 text-xs font-mono text-white font-bold">
                Baseline Gas Resistance: {experiment.controls.emptyContainerBaselineResistanceKohm} kΩ
              </div>
            )}
          </div>
        </div>

        {experiment.controls.notes && (
          <div className="mt-4 text-xs text-neutral-300 bg-neutral-950 p-3 rounded-lg border border-neutral-800">
            <strong className="text-white">Control Run Notes:</strong> {experiment.controls.notes}
          </div>
        )}
      </div>

      {/* Associated Samples Table */}
      <div className="bg-black border border-neutral-800 rounded-xl p-6 text-white space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-white" />
            <h3 className="text-sm font-bold text-white">
              Registered Samples ({samples.length})
            </h3>
          </div>
          <Link href={`/samples?experimentId=${experiment.id}`}>
            <Button variant="primary" size="sm">
              <Plus className="w-3.5 h-3.5 mr-1 text-black" />
              Register Sample for this Experiment
            </Button>
          </Link>
        </div>

        {samples.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-400">
            No cake samples registered for this experiment yet.
          </div>
        ) : (
          <div className="overflow-x-auto border border-neutral-800 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-white bg-neutral-900 border-b border-neutral-800">
                <tr>
                  <th className="py-3 px-4">Sample ID</th>
                  <th className="py-3 px-4">Cake Category</th>
                  <th className="py-3 px-4">Storage Condition</th>
                  <th className="py-3 px-4">Replicate</th>
                  <th className="py-3 px-4">Test Status</th>
                  <th className="py-3 px-4">Mass</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {samples.map((s) => (
                  <tr key={s.id} className="hover:bg-neutral-900 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-white">{s.id}</td>
                    <td className="py-3 px-4 text-white font-medium">{s.category}</td>
                    <td className="py-3 px-4 text-white">{s.storageCondition}</td>
                    <td className="py-3 px-4 text-white">{s.replicateNumber}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="py-3 px-4 text-white">
                      {s.massGrams ? `${s.massGrams} g` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/assess?sampleId=${s.id}`}
                        className="text-white hover:underline font-bold"
                      >
                        Assess →
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
    <Suspense fallback={<div className="p-8 text-center text-white">Loading experiment...</div>}>
      <ExperimentDetailInner params={params} />
    </Suspense>
  );
}

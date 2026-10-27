'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/app-context';
import { services } from '@/services';
import { FreshnessLabel, ManualAssessment, SampleAssessmentSummary } from '@/types/assessment';
import { Button } from '@/components/common/button';
import { StatusBadge } from '@/components/common/badge';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { EmptyState } from '@/components/common/empty-state';
import { formatDate } from '@/lib/utils';
import {
  Smartphone,
  AlertTriangle,
  CheckCircle2,
  ThumbsUp,
  MinusCircle,
  ThumbsDown,
  Info,
  History,
  Star,
  Users,
  Layers,
  Download,
} from 'lucide-react';

function AssessmentTerminal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSampleId = searchParams.get('sampleId');

  const { samples, session, refreshData } = useApp();

  const [selectedSampleId, setSelectedSampleId] = useState<string>(urlSampleId || '');
  const [selectedLabel, setSelectedLabel] = useState<FreshnessLabel | null>(null);
  const [confidence, setConfidence] = useState<number>(4);
  const [notes, setNotes] = useState('');
  const [assessorName, setAssessorName] = useState(session?.displayName || 'Assessor 1');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [summary, setSummary] = useState<SampleAssessmentSummary | null>(null);
  const [allAssessments, setAllAssessments] = useState<ManualAssessment[]>([]);

  const effectiveSampleId = selectedSampleId || (samples.length > 0 ? samples[0].id : '');

  const activeSample = useMemo(() => {
    return samples.find((s) => s.id === effectiveSampleId) || null;
  }, [samples, effectiveSampleId]);

  const loadAssessments = async (sampleId: string) => {
    if (!sampleId) return;
    try {
      const summ = await services.assessments.getSummaryForSample(sampleId);
      setSummary(summ);
      const all = await services.assessments.getAssessments();
      setAllAssessments(all);
    } catch (e) {
      console.error('Failed to load sample assessments:', e);
    }
  };

  useEffect(() => {
    if (effectiveSampleId) {
      loadAssessments(effectiveSampleId);
    }
  }, [effectiveSampleId]);

  const handleOpenConfirm = (label: FreshnessLabel) => {
    setSelectedLabel(label);
    setIsConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    if (!activeSample || !selectedLabel) return;
    setIsSubmitting(true);
    setFeedbackMessage(null);

    try {
      await services.assessments.submitAssessment({
        experimentId: activeSample.experimentId,
        sampleId: activeSample.id,
        assessorName: assessorName.trim() || 'Anonymous Assessor',
        assessorId: session?.userId || 'usr_anon',
        label: selectedLabel,
        confidenceRating: confidence,
        notes: notes.trim() || undefined,
      });

      // Clear local fields
      setNotes('');
      setIsConfirmOpen(false);
      setFeedbackMessage({
        type: 'success',
        text: `Logged "${selectedLabel}" assessment for ${activeSample.id} successfully!`,
      });

      await refreshData();
      await loadAssessments(activeSample.id);
    } catch (err: unknown) {
      setFeedbackMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to submit assessment.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportAllAssessments = async () => {
    const list = await services.assessments.getAssessments();
    const csv = services.assessments.exportToCsv(list);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nosenet_manual_assessments_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6">
      {/* Second Phone Architecture Disclosure Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-cyan-400 shrink-0" />
            <h2 className="font-semibold text-slate-100 text-sm">
              Mobile Assessor Terminal (Second-Phone Ready)
            </h2>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            Phase 1: Local Storage Session
          </span>
        </div>

        <p className="text-slate-400 text-xs leading-relaxed">
          <strong>Important Architecture Notice:</strong> Browser localStorage is isolated per device and browser profile.
          In this local development version, assessments saved on this device persist in this browser. True real-time
          synchronization between separate physical phones will be enabled in Phase 2 via a shared WebSocket / REST backend.
          Assessment interfaces and services are fully modular to allow instantaneous transition without rewriting.
        </p>
      </div>

      {/* Assessor Name Configuration */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Assessor Identity
            </label>
            <input
              type="text"
              value={assessorName}
              onChange={(e) => setAssessorName(e.target.value)}
              placeholder="e.g. Dr. Sharma or Student Assessor"
              className="mt-0.5 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 font-medium focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Sample Selector */}
        <div className="flex-1 max-w-sm">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Choose Specimen To Evaluate
          </label>
          <select
            value={selectedSampleId}
            onChange={(e) => setSelectedSampleId(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
          >
            {samples.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id} — {s.category} ({s.storageCondition})
              </option>
            ))}
          </select>
        </div>
      </div>

      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}
        >
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Main Specimen & Assessment Submission Card */}
      {activeSample ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-6">
          {/* Sample Information Header */}
          <div className="pb-5 border-b border-slate-800">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-mono text-base font-bold text-cyan-400">
                {activeSample.id}
              </span>
              <div className="flex items-center gap-2">
                <StatusBadge status={activeSample.status} />
                <span className="text-xs text-slate-500 font-mono">
                  {formatDate(activeSample.testDateTime)}
                </span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-slate-500 text-[10px] block uppercase">Cake Category</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">{activeSample.category}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-slate-500 text-[10px] block uppercase">Storage</span>
                <span className="font-semibold text-amber-300 mt-0.5 block">{activeSample.storageCondition}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-slate-500 text-[10px] block uppercase">Replicate</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">{activeSample.replicateNumber}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-slate-500 text-[10px] block uppercase">Experiment</span>
                <span className="font-semibold text-cyan-300 mt-0.5 block font-mono">{activeSample.experimentId}</span>
              </div>
            </div>

            {activeSample.notes && (
              <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs text-slate-400">
                <strong className="text-slate-300">Sample Notes:</strong> {activeSample.notes}
              </div>
            )}
          </div>

          {/* Three Large Touch Targets for Assessor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Step 1: Select Sensory Quality Verdict *
              </label>
              <span className="text-[11px] text-slate-500">Select exactly one</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Fresh Button */}
              <button
                type="button"
                onClick={() => handleOpenConfirm('Fresh')}
                className="group relative p-5 rounded-2xl border transition-all text-left flex flex-col justify-between bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-950/40 active:scale-[0.98]"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition-transform">
                    <ThumbsUp className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-400">
                    Grade A
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-emerald-300">Fresh</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-snug">
                    Natural pleasant bakery aroma, no off-flavor, optimal crumb moisture.
                  </p>
                </div>
              </button>

              {/* Average Button */}
              <button
                type="button"
                onClick={() => handleOpenConfirm('Average')}
                className="group relative p-5 rounded-2xl border transition-all text-left flex flex-col justify-between bg-amber-950/20 border-amber-500/30 hover:border-amber-400 hover:bg-amber-950/40 active:scale-[0.98]"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30 group-hover:scale-110 transition-transform">
                    <MinusCircle className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] uppercase font-bold tracking-wider text-amber-400">
                    Grade B
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-amber-300">Average</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-snug">
                    Marginal staling, muted aroma, dryness at edges, borderline acceptability.
                  </p>
                </div>
              </button>

              {/* Not Good Button */}
              <button
                type="button"
                onClick={() => handleOpenConfirm('Not Good')}
                className="group relative p-5 rounded-2xl border transition-all text-left flex flex-col justify-between bg-rose-950/20 border-rose-500/30 hover:border-rose-400 hover:bg-rose-950/40 active:scale-[0.98]"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center border border-rose-500/30 group-hover:scale-110 transition-transform">
                    <ThumbsDown className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] uppercase font-bold tracking-wider text-rose-400">
                    Grade C
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-rose-300">Not Good</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-snug">
                    Off-odor, rancidity, sour cream notes, or microbial degradation detected.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Optional Evaluation Parameters */}
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Step 2: Optional Confidence & Olfactory Notes
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">
                  Confidence Rating (1 to 5 Stars):
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setConfidence(star)}
                      className="p-1 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= confidence
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-slate-400 font-mono ml-2">
                    {confidence} / 5
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">
                  Olfactory & Crumb Notes:
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Mild buttery aroma, slight crust hardening..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Sensory Disclaimer */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-500 flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              <strong>Scientific Disclaimer:</strong> Manual sensory labels reflect human organoleptic observations and
              panelist consensus. They serve as human ground truth for pattern correlation and do not substitute for
              official microbiological lab assays.
            </span>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Layers}
          title="No samples available"
          description="Register cake samples first or seed the college project demo dataset."
          actionLabel="Go to Sample Registration"
          onAction={() => router.push('/samples')}
        />
      )}

      {/* Evaluation History & Disagreement Analysis */}
      {activeSample && summary && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-slate-100">
                Sensory Evaluation History for {activeSample.id}
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {summary.totalAssessments} {summary.totalAssessments === 1 ? 'assessment' : 'assessments'}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportAllAssessments}
              disabled={allAssessments.length === 0}
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Export All Assessments CSV
            </Button>
          </div>

          {/* Disagreement Warning Banner */}
          {summary.hasDisagreement && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-200">Panel Disagreement Detected:</strong> Assessors have logged
                conflicting sensory evaluations for this sample (labels: {summary.distinctLabels.join(', ')}).
                All individual records are preserved in full history without overwriting.
              </div>
            </div>
          )}

          {summary.allAssessments.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500">
              No sensory evaluations logged for this sample yet. Click Fresh, Average, or Not Good above to submit.
            </div>
          ) : (
            <div className="space-y-2.5">
              {summary.allAssessments.map((a) => (
                <div
                  key={a.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <StatusBadge status={a.label} />
                    <div>
                      <div className="font-semibold text-slate-200">
                        {a.assessorName}
                      </div>
                      {a.notes && (
                        <p className="text-slate-400 text-[11px] italic mt-0.5">
                          &ldquo;{a.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 shrink-0 self-end sm:self-auto font-mono">
                    {a.confidenceRating && (
                      <span className="text-amber-400">
                        ★ {a.confidenceRating} / 5
                      </span>
                    )}
                    <span>{formatDate(a.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Step Before Saving Assessment */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmSubmit}
        title="Confirm Sensory Assessment"
        description={`Are you sure you want to log "${selectedLabel}" for sample ${activeSample?.id}? This will record your evaluation with timestamp and preserve it permanently in the research log.`}
        confirmLabel={`Submit "${selectedLabel}"`}
        isLoading={isSubmitting}
      />
    </div>
  );
}

export default function AssessPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading terminal...</div>}>
      <AssessmentTerminal />
    </Suspense>
  );
}

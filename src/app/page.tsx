'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/app-context';
import { services } from '@/services';
import { StatCard } from '@/components/dashboard/stat-card';
import { AIStatusBanner } from '@/components/dashboard/ai-status-banner';
import { Button } from '@/components/common/button';
import { StatusBadge } from '@/components/common/badge';
import { EmptyState } from '@/components/common/empty-state';
import { AIReadinessMetrics } from '@/types/ai';
import { ManualAssessment, SampleAssessmentSummary } from '@/types/assessment';
import { formatDate } from '@/lib/utils';
import {
  FlaskConical,
  Layers,
  LineChart,
  ClipboardCheck,
  Clock,
  Plus,
  Upload,
  ArrowRight,
  Sparkles,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const router = useRouter();
  const { experiments, samples, sensorReadingsCount, assessmentsCount, refreshData } =
    useApp();

  const [aiMetrics, setAiMetrics] = useState<AIReadinessMetrics | null>(null);
  const [latestAssessments, setLatestAssessments] = useState<ManualAssessment[]>([]);
  const [summaries, setSummaries] = useState<Record<string, SampleAssessmentSummary>>({});
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    async function loadExtraDashboardData() {
      const [metrics, asms, summs] = await Promise.all([
        services.ai.getReadinessMetrics(),
        services.assessments.getAssessments(),
        services.assessments.getAllSummaries(),
      ]);
      setAiMetrics(metrics);
      setLatestAssessments(asms.slice(0, 5));
      setSummaries(summs);
    }
    loadExtraDashboardData();
  }, [experiments, samples, sensorReadingsCount, assessmentsCount]);

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      await services.backup.seedCollegeDemoDataset();
      await refreshData();
      const [metrics, asms, summs] = await Promise.all([
        services.ai.getReadinessMetrics(),
        services.assessments.getAssessments(),
        services.assessments.getAllSummaries(),
      ]);
      setAiMetrics(metrics);
      setLatestAssessments(asms.slice(0, 5));
      setSummaries(summs);
    } catch (e) {
      console.error('Failed to seed demo dataset:', e);
    } finally {
      setIsSeeding(false);
    }
  };

  // Samples awaiting assessment: samples with 0 evaluations
  const samplesAwaitingCount = samples.filter((s) => !summaries[s.id] || summaries[s.id].totalAssessments === 0).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <span>Research Dashboard</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-400 border border-slate-700 font-normal">
              College IoT Capstone
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            IoT-based electronic nose monitoring for cake freshness, storage decay, and sensory validation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {experiments.length === 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSeedData}
              isLoading={isSeeding}
              className="text-cyan-300 border-cyan-800/50 hover:bg-cyan-950/40"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-cyan-400" />
              Load Sample Experiment Dataset
            </Button>
          )}

          <Link href="/sensor">
            <Button variant="outline" size="sm">
              <Upload className="w-3.5 h-3.5 mr-1" />
              Import CSV
            </Button>
          </Link>

          <Link href="/experiments">
            <Button variant="primary" size="sm">
              <Plus className="w-3.5 h-3.5 mr-1" />
              New Experiment
            </Button>
          </Link>
        </div>
      </div>

      {/* AI Model Status Card */}
      {aiMetrics && <AIStatusBanner metrics={aiMetrics} />}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4 mb-8">
        <StatCard
          label="Experiments"
          value={experiments.length}
          subtext={`${experiments.filter((e) => e.status === 'Active').length} currently active`}
          icon={FlaskConical}
          variant="cyan"
        />
        <StatCard
          label="Registered Samples"
          value={samples.length}
          subtext={`${samples.filter((s) => s.status === 'Completed').length} completed testing`}
          icon={Layers}
          variant="blue"
        />
        <StatCard
          label="Sensor Readings"
          value={sensorReadingsCount.toLocaleString()}
          subtext="Actual ESP32 data points"
          icon={LineChart}
          variant="purple"
        />
        <StatCard
          label="Manual Assessments"
          value={assessmentsCount}
          subtext="Human sensory logs"
          icon={ClipboardCheck}
          variant="emerald"
        />
        <StatCard
          label="Awaiting Assessment"
          value={samplesAwaitingCount}
          subtext="Pending human evaluation"
          icon={Clock}
          variant="amber"
        />
      </div>

      {/* Two-Column Layout: Experiments & Assessments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Experiments (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-slate-100">Recent Experiments</h3>
              </div>
              <Link
                href="/experiments"
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>View All ({experiments.length})</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {experiments.length === 0 ? (
              <EmptyState
                icon={FlaskConical}
                title="No experiments registered yet"
                description="Register your first cake experiment or load the college demo dataset to explore the dashboard."
                actionLabel="Create Experiment"
                onAction={() => router.push('/experiments')}
                secondaryActionLabel="Load Sample Dataset"
                onSecondaryAction={handleSeedData}
              />
            ) : (
              <div className="space-y-3">
                {experiments.slice(0, 4).map((exp) => (
                  <Link
                    key={exp.id}
                    href={`/experiments/${exp.id}`}
                    className="block p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-medium text-cyan-400">
                            {exp.id}
                          </span>
                          <StatusBadge status={exp.status} />
                          {exp.controls.roomStageCompleted && exp.controls.emptyContainerStageCompleted && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950/60 text-purple-300 border border-purple-800/50">
                              Controls Verified
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-medium text-slate-200 mt-1.5 group-hover:text-cyan-300 transition-colors">
                          {exp.name}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                          {exp.description || 'No description provided.'}
                        </p>
                      </div>
                      <span className="text-[11px] text-slate-500 shrink-0 font-mono">
                        {formatDate(exp.createdAt)}
                      </span>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{exp.sampleIds.length} Samples associated</span>
                      <span>{exp.plannedDurationMinutes}m planned</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Latest Manual Assessments (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-slate-100">Latest Sensory Logs</h3>
              </div>
              <Link
                href="/assess"
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>Assess Samples</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {latestAssessments.length === 0 ? (
              <EmptyState
                icon={ClipboardCheck}
                title="No sensory assessments yet"
                description="Use the second-phone assessor terminal to log Fresh, Average, or Not Good human sensory evaluations."
                actionLabel="Open Assessor Terminal"
                onAction={() => router.push('/assess')}
              />
            ) : (
              <div className="space-y-3">
                {latestAssessments.map((asm) => {
                  const summary = summaries[asm.sampleId];
                  return (
                    <div
                      key={asm.id}
                      className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={asm.label} />
                          <span className="font-mono text-slate-300 font-medium">
                            {asm.sampleId}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {formatDate(asm.createdAt)}
                        </span>
                      </div>

                      {summary?.hasDisagreement && (
                        <div className="mt-2 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Assessors disagree on this sample ({summary.distinctLabels.join(', ')})</span>
                        </div>
                      )}

                      {asm.notes && (
                        <p className="text-slate-400 mt-2 text-[11px] italic">
                          &ldquo;{asm.notes}&rdquo;
                        </p>
                      )}

                      <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Assessor: {asm.assessorName}</span>
                        {asm.confidenceRating && (
                          <span>Confidence: {asm.confidenceRating} / 5</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80">
            <Link
              href="/assess"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
            >
              <span>Go to Mobile Assessor Screen</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

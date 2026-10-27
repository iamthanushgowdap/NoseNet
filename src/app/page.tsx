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

  const samplesAwaitingCount = samples.filter(
    (s) => !summaries[s.id] || summaries[s.id].totalAssessments === 0
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full bg-black text-white space-y-8">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <span>Research Dashboard</span>
            <span className="text-xs px-2.5 py-0.5 rounded bg-neutral-900 text-white border border-neutral-700 font-mono">
              College Capstone
            </span>
          </h1>
          <p className="text-xs text-neutral-300 mt-1">
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
              className="text-white border-white"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-white" />
              Load Sample Experiment Dataset
            </Button>
          )}

          <Link href="/sensor">
            <Button variant="outline" size="sm">
              <Upload className="w-3.5 h-3.5 mr-1 text-white" />
              Import CSV
            </Button>
          </Link>

          <Link href="/experiments">
            <Button variant="primary" size="sm">
              <Plus className="w-3.5 h-3.5 mr-1 text-black" />
              New Experiment
            </Button>
          </Link>
        </div>
      </div>

      {/* AI Model Status Card */}
      {aiMetrics && <AIStatusBanner metrics={aiMetrics} />}

      {/* Metrics Row - Orderly 5 Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <StatCard
          label="Experiments"
          value={experiments.length}
          subtext={`${experiments.filter((e) => e.status === 'Active').length} active runs`}
          icon={FlaskConical}
        />
        <StatCard
          label="Registered Samples"
          value={samples.length}
          subtext={`${samples.filter((s) => s.status === 'Completed').length} completed testing`}
          icon={Layers}
        />
        <StatCard
          label="Sensor Readings"
          value={sensorReadingsCount.toLocaleString()}
          subtext="Actual ESP32 data points"
          icon={LineChart}
        />
        <StatCard
          label="Manual Assessments"
          value={assessmentsCount}
          subtext="Human sensory logs"
          icon={ClipboardCheck}
        />
        <StatCard
          label="Awaiting Assessment"
          value={samplesAwaitingCount}
          subtext="Pending human verdict"
          icon={Clock}
        />
      </div>

      {/* Two-Column Layout: Experiments & Assessments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Experiments (7 cols) */}
        <div className="lg:col-span-7 bg-black border border-neutral-800 rounded-xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-4">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-white" />
                <h3 className="text-sm font-bold text-white">Recent Experiments</h3>
              </div>
              <Link
                href="/experiments"
                className="text-xs text-white hover:underline flex items-center gap-1 font-semibold"
              >
                <span>View All ({experiments.length})</span>
                <ChevronRight className="w-3 h-3 text-white" />
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
                    className="block p-4 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-white transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold text-white">
                            {exp.id}
                          </span>
                          <StatusBadge status={exp.status} />
                          {exp.controls.roomStageCompleted && exp.controls.emptyContainerStageCompleted && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-900 text-white border border-neutral-700">
                              Controls Verified
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-white mt-1.5 group-hover:underline">
                          {exp.name}
                        </h4>
                        <p className="text-xs text-neutral-300 line-clamp-1 mt-0.5">
                          {exp.description || 'No description provided.'}
                        </p>
                      </div>
                      <span className="text-[11px] text-neutral-400 shrink-0 font-mono">
                        {formatDate(exp.createdAt)}
                      </span>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-300">
                      <span>{exp.sampleIds.length} Samples registered</span>
                      <span>{exp.plannedDurationMinutes}m planned duration</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Latest Manual Assessments (5 cols) */}
        <div className="lg:col-span-5 bg-black border border-neutral-800 rounded-xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-4">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-white" />
                <h3 className="text-sm font-bold text-white">Latest Sensory Logs</h3>
              </div>
              <Link
                href="/assess"
                className="text-xs text-white hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Assess Specimen</span>
                <ChevronRight className="w-3 h-3 text-white" />
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
                      className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={asm.label} />
                          <span className="font-mono text-white font-bold">
                            {asm.sampleId}
                          </span>
                        </div>
                        <span className="text-[11px] text-neutral-400 font-mono">
                          {formatDate(asm.createdAt)}
                        </span>
                      </div>

                      {summary?.hasDisagreement && (
                        <div className="mt-2 px-2 py-1 rounded bg-black border border-amber-500 text-amber-300 text-[11px] flex items-center gap-1.5 font-medium">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Panel Disagreement ({summary.distinctLabels.join(', ')})</span>
                        </div>
                      )}

                      {asm.notes && (
                        <p className="text-neutral-200 mt-2 text-[11px] italic">
                          &ldquo;{asm.notes}&rdquo;
                        </p>
                      )}

                      <div className="mt-2.5 pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
                        <span>Assessor: <strong className="text-white">{asm.assessorName}</strong></span>
                        {asm.confidenceRating && (
                          <span className="text-white font-semibold">Confidence: {asm.confidenceRating} / 5</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-800">
            <Link
              href="/assess"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold border border-neutral-700 transition-colors"
            >
              <span>Open Mobile Assessor Terminal</span>
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

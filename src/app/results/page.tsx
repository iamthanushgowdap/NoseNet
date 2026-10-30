'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  BarChart3,
  Flame,
  CheckCircle2,
  Calendar,
  Layers,
  Info,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Plus,
  X,
} from 'lucide-react';
import { TestRun, TestReport } from '@/types/test-run';
import { LiveSensorReading } from '@/types/serial';
import { idbStorage } from '@/lib/storage/indexed-db';
import { ReportService } from '@/services/report-service';
import { formatDate } from '@/lib/utils';

const LINE_COLORS = ['#38bdf8', '#f59e0b', '#10b981', '#f43f5e'];

function ComparisonContent() {
  const searchParams = useSearchParams();
  const initialCompareId = searchParams.get('compare');

  const [allTests, setAllTests] = useState<TestRun[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [testReports, setTestReports] = useState<TestReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all tests from IndexedDB
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const tests = await idbStorage.getAllTestRuns();
        setAllTests(tests);

        if (initialCompareId && tests.some((t) => t.id === initialCompareId)) {
          setSelectedIds([initialCompareId]);
        } else if (tests.length > 0) {
          // Select up to first 2 by default
          setSelectedIds(tests.slice(0, 2).map((t) => t.id));
        }
      } catch (e) {
        console.error('Failed to load tests for comparison:', e);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [initialCompareId]);

  // Load readings and calculate reports for selected test runs
  useEffect(() => {
    async function compileSelectedReports() {
      if (selectedIds.length === 0) {
        setTestReports([]);
        return;
      }

      try {
        const reports: TestReport[] = [];
        for (const id of selectedIds) {
          const test = allTests.find((t) => t.id === id);
          if (test) {
            const readings = await idbStorage.getReadingsForTest(id);
            const report = ReportService.calculateReport(test, readings, test.humanAssessment);
            reports.push(report);
          }
        }
        setTestReports(reports);
      } catch (e) {
        console.error('Failed to compute comparison reports:', e);
      }
    }

    compileSelectedReports();
  }, [selectedIds, allTests]);

  const handleToggleTest = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= 4) {
        alert('You can compare a maximum of 4 tests simultaneously.');
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Build merged aligned timeseries for Recharts (keyed by elapsed second)
  const chartData = useMemo(() => {
    if (testReports.length === 0) return [];

    // Find maximum duration across selected tests
    const maxDuration = Math.max(
      ...testReports.map((r) => r.testRun.actualDurationSeconds || 360),
      60
    );

    // Create 1-second sample points
    const timePoints: Record<number, any> = {};
    for (let s = 0; s <= maxDuration; s += 2) {
      timePoints[s] = { timeSec: s };
    }

    testReports.forEach((rep, reportIndex) => {
      const key = `test_${rep.testRun.id}`;
      rep.readings.forEach((r) => {
        const sec = Math.round(r.elapsed_ms / 1000);
        // Find closest point
        const bucket = Math.round(sec / 2) * 2;
        if (timePoints[bucket] && r.gas_resistance_kohm) {
          timePoints[bucket][key] = r.gas_resistance_kohm;
        }
      });
    });

    return Object.values(timePoints).sort((a, b) => a.timeSec - b.timeSec);
  }, [testReports]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full bg-black text-white space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-white" />
              <span>Sensor Results Comparison</span>
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-700 font-mono">
              Up to 4 Tests
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
            Side-by-side evaluation of BME688 gas resistance curves across storage conditions (Frozen vs Unfrozen) and cake categories (Normal vs Pastry).
          </p>
        </div>

        <Link
          href="/history"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-xs font-semibold text-neutral-300 hover:text-white transition"
        >
          <span>View All History</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Mandatory Scientific Interpretation Notice */}
      <div className="p-4 rounded-xl border border-neutral-700 bg-neutral-950 flex items-start gap-3.5">
        <ShieldAlert className="w-5 h-5 text-neutral-300 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            Sensor observations — freshness classification not yet validated
          </h4>
          <p className="text-xs text-neutral-400 leading-relaxed">
            The overlaid trajectories compare real empirical responses of the BME688 metal-oxide sensor across your designated test runs. Differences in delta gas resistance (ΔR_gas) reflect volatile compound concentrations in the sampling headspace; they do not represent an automated algorithmic verdict.
          </p>
        </div>
      </div>

      {/* Test Selection Drawer / Filter Pills */}
      <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-950 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
            Select Test Runs to Compare ({selectedIds.length} / 4 Selected)
          </span>
          {selectedIds.length > 0 && (
            <button
              onClick={() => setSelectedIds([])}
              className="text-[11px] text-neutral-400 hover:text-white underline"
            >
              Clear selection
            </button>
          )}
        </div>

        {allTests.length === 0 ? (
          <div className="text-xs text-neutral-500 py-3">
            No test runs available in IndexedDB yet. Run a test first from the{' '}
            <Link href="/run-test" className="text-white underline">
              Run Test page
            </Link>
            .
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            {allTests.map((t) => {
              const isSelected = selectedIds.includes(t.id);
              const colorIndex = selectedIds.indexOf(t.id);
              const badgeColor = isSelected ? LINE_COLORS[colorIndex % LINE_COLORS.length] : undefined;

              return (
                <button
                  key={t.id}
                  onClick={() => handleToggleTest(t.id)}
                  style={isSelected ? { borderColor: badgeColor, backgroundColor: '#171717' } : {}}
                  className={`px-3 py-2 rounded-lg border text-xs font-mono transition flex items-center gap-2 ${
                    isSelected
                      ? 'text-white border-neutral-400'
                      : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: isSelected ? badgeColor : '#525252' }}
                  />
                  <span className="font-semibold text-white">{t.sampleId}</span>
                  <span className="text-neutral-400 text-[11px]">
                    ({t.cakeCategory.split(' ')[0]} • {t.storageCondition.slice(0, 4)})
                  </span>
                  <span className="text-neutral-500 text-[10px]">{t.id.slice(-6)}</span>
                  {isSelected && <X className="w-3 h-3 text-neutral-400 hover:text-white ml-1" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {testReports.length > 0 && (
        <>
          {/* Overlaid Gas Resistance Chart */}
          <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-950 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-white" />
                <span>Overlaid Gas Resistance Trajectories (R_gas in kΩ vs Elapsed Time)</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Direct comparison of gas sensor responses over time across selected samples.
              </p>
            </div>

            <div className="h-96 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis
                    dataKey="timeSec"
                    stroke="#737373"
                    fontSize={11}
                    tickLine={false}
                    label={{
                      value: 'Elapsed Time (seconds)',
                      position: 'insideBottom',
                      offset: -10,
                      fill: '#737373',
                      fontSize: 11,
                    }}
                  />
                  <YAxis
                    stroke="#737373"
                    fontSize={11}
                    tickLine={false}
                    domain={['auto', 'auto']}
                    label={{
                      value: 'Gas Resistance (kΩ)',
                      angle: -90,
                      position: 'insideLeft',
                      fill: '#737373',
                      fontSize: 11,
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#000000',
                      borderColor: '#404040',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    labelFormatter={(val) => `Elapsed: ${val}s`}
                    formatter={(val: any, name: any) => [
                      `${Number(val).toFixed(2)} kΩ`,
                      name,
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  {testReports.map((rep, idx) => {
                    const color = LINE_COLORS[idx % LINE_COLORS.length];
                    const label = `${rep.testRun.sampleId} (${rep.testRun.cakeCategory} - ${rep.testRun.storageCondition})`;
                    return (
                      <Line
                        key={rep.testRun.id}
                        type="monotone"
                        dataKey={`test_${rep.testRun.id}`}
                        name={label}
                        stroke={color}
                        strokeWidth={2}
                        dot={false}
                        connectNulls
                        isAnimationActive={false}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Comparative Metrics Table */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden space-y-4 p-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-white" />
              <span>Comparative Statistical Metrics Summary</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-900/40 text-neutral-400 font-mono">
                    <th className="py-3 px-3 font-medium">Sample / Test ID</th>
                    <th className="py-3 px-3 font-medium">Condition & Stage</th>
                    <th className="py-3 px-3 font-medium">R_gas Mean</th>
                    <th className="py-3 px-3 font-medium">R_gas Start → End</th>
                    <th className="py-3 px-3 font-medium">Δ R_gas (Shift)</th>
                    <th className="py-3 px-3 font-medium">Mean Temp</th>
                    <th className="py-3 px-3 font-medium">Mean RH</th>
                    <th className="py-3 px-3 font-medium">Human Verdict</th>
                    <th className="py-3 px-3 font-medium text-right">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900">
                  {testReports.map((rep, idx) => {
                    const color = LINE_COLORS[idx % LINE_COLORS.length];
                    return (
                      <tr key={rep.testRun.id} className="hover:bg-neutral-900/30 transition">
                        {/* Sample / Test ID */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                            <div>
                              <div className="font-semibold text-white">{rep.testRun.sampleId}</div>
                              <div className="font-mono text-[11px] text-neutral-500">{rep.testRun.id}</div>
                            </div>
                          </div>
                        </td>

                        {/* Condition */}
                        <td className="py-3 px-3">
                          <div className="text-neutral-200">{rep.testRun.cakeCategory}</div>
                          <div className="text-[11px] text-neutral-400 capitalize">
                            {rep.testRun.storageCondition} • {rep.testRun.stage}
                          </div>
                        </td>

                        {/* Gas Mean */}
                        <td className="py-3 px-3 font-mono font-medium text-white">
                          {rep.gasResistance.mean.toFixed(2)} kΩ
                        </td>

                        {/* Start -> End */}
                        <td className="py-3 px-3 font-mono text-neutral-300">
                          {rep.gasResistance.start.toFixed(2)} → {rep.gasResistance.end.toFixed(2)} kΩ
                        </td>

                        {/* Delta */}
                        <td className="py-3 px-3 font-mono">
                          <span className={rep.gasResistance.delta >= 0 ? 'text-emerald-400' : 'text-amber-400'}>
                            {rep.gasResistance.delta > 0 ? '+' : ''}
                            {rep.gasResistance.delta.toFixed(2)} kΩ ({rep.gasResistance.percentChange}%)
                          </span>
                        </td>

                        {/* Temp */}
                        <td className="py-3 px-3 font-mono text-neutral-300">
                          {rep.temperature.mean.toFixed(1)} °C
                        </td>

                        {/* Humidity */}
                        <td className="py-3 px-3 font-mono text-neutral-300">
                          {rep.humidity.mean.toFixed(1)} %
                        </td>

                        {/* Human Verdict */}
                        <td className="py-3 px-3">
                          {rep.humanAssessment ? (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-mono capitalize bg-neutral-900 border border-neutral-700 text-neutral-300">
                              {rep.humanAssessment.humanAssessment}
                            </span>
                          ) : (
                            <span className="text-[11px] text-neutral-500 font-mono">None</span>
                          )}
                        </td>

                        {/* Link */}
                        <td className="py-3 px-3 text-right">
                          <Link
                            href={`/results/${rep.testRun.id}`}
                            className="inline-flex items-center gap-1 text-xs text-white hover:underline font-medium"
                          >
                            <span>Report</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function ResultsComparisonPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-neutral-400">
          <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-3 text-white" />
          <p className="text-sm">Loading comparison interface...</p>
        </div>
      }
    >
      <ComparisonContent />
    </Suspense>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  History,
  Filter,
  Search,
  Download,
  Trash2,
  ExternalLink,
  ChevronRight,
  Layers,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  RefreshCw,
} from 'lucide-react';
import { TestRun, CakeCategory, StorageCondition, TestStage, TestStatus } from '@/types/test-run';
import { idbStorage } from '@/lib/storage/indexed-db';
import { ExportService } from '@/services/export-service';
import { formatDate } from '@/lib/utils';

export default function TestHistoryPage() {
  const [tests, setTests] = useState<TestRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStorage, setSelectedStorage] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const loadTests = async () => {
    setIsLoading(true);
    try {
      const data = await idbStorage.getAllTestRuns();
      setTests(data);
    } catch (e) {
      console.error('Failed to load tests:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, []);

  const handleDelete = async (testId: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete test run ${testId}? This cannot be undone.`)) {
      return;
    }
    try {
      await idbStorage.deleteTestRun(testId);
      await loadTests();
    } catch (e) {
      console.error('Failed to delete test run:', e);
      alert('Error deleting test run: ' + (e as Error).message);
    }
  };

  const handleExportSingle = async (test: TestRun) => {
    setIsExporting(test.id);
    try {
      const readings = await idbStorage.getReadingsForTest(test.id);
      const csv = ExportService.exportRawReadingsCsv(test, readings);
      ExportService.triggerDownload(csv, `nosenet_raw_${test.id}_${test.sampleId}.csv`, 'text/csv;charset=utf-8;');
    } catch (e) {
      console.error('Failed to export raw readings:', e);
      alert('Failed to export readings: ' + (e as Error).message);
    } finally {
      setIsExporting(null);
    }
  };

  const filteredTests = tests.filter((t) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = t.id.toLowerCase().includes(q);
      const matchSample = t.sampleId.toLowerCase().includes(q);
      const matchNotes = t.operatorNotes?.toLowerCase().includes(q);
      if (!matchId && !matchSample && !matchNotes) return false;
    }
    if (selectedCategory !== 'all' && t.cakeCategory !== selectedCategory) return false;
    if (selectedStorage !== 'all' && t.storageCondition !== selectedStorage) return false;
    if (selectedStage !== 'all' && t.stage !== selectedStage) return false;
    if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;
    return true;
  });

  const handleExportFilteredSummary = () => {
    if (filteredTests.length === 0) return;
    const csv = ExportService.exportTestRunsSummaryCsv(filteredTests);
    ExportService.triggerDownload(csv, `nosenet_test_history_summary_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full bg-black text-white space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <History className="w-7 h-7 text-white" />
              <span>Sensor Test History</span>
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-700 font-mono">
              {tests.length} Total Runs
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
            Complete historical registry of real ESP32 + BME688 test sessions, persisted in IndexedDB with raw timeseries and assessments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadTests}
            className="p-2 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white transition"
            title="Refresh database"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportFilteredSummary}
            disabled={filteredTests.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Summary CSV</span>
          </button>
          <Link
            href="/run-test"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition"
          >
            <PlayCircle className="w-4 h-4" />
            <span>New Test Run</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Search Query */}
          <div className="md:col-span-1 relative">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sample or test ID..."
              className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-neutral-500"
            >
              <option value="all">All Cake Categories</option>
              <option value="Normal cake">Normal cake</option>
              <option value="Pastry cake">Pastry cake</option>
            </select>
          </div>

          {/* Storage Filter */}
          <div>
            <select
              value={selectedStorage}
              onChange={(e) => setSelectedStorage(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-neutral-500"
            >
              <option value="all">All Storage Conditions</option>
              <option value="unfrozen">Unfrozen (ambient / counter)</option>
              <option value="frozen">Frozen (cold storage)</option>
            </select>
          </div>

          {/* Stage Filter */}
          <div>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-neutral-500"
            >
              <option value="all">All Test Stages</option>
              <option value="Cake sample">Cake sample</option>
              <option value="Room control">Room control</option>
              <option value="Empty-container control">Empty-container control</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-neutral-500"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="interrupted">Interrupted</option>
              <option value="invalid">Invalid</option>
              <option value="testing">Testing</option>
            </select>
          </div>
        </div>

        {/* Filter info indicator */}
        <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-neutral-900">
          <div>
            Showing <span className="font-semibold text-white">{filteredTests.length}</span> of{' '}
            <span className="font-semibold text-white">{tests.length}</span> test runs
          </div>
          {(searchQuery || selectedCategory !== 'all' || selectedStorage !== 'all' || selectedStage !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedStorage('all');
                setSelectedStage('all');
                setSelectedStatus('all');
              }}
              className="text-neutral-400 hover:text-white underline text-[11px]"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Tests Table */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden">
        {isLoading ? (
          <div className="text-center py-16 text-neutral-400 text-xs">
            <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-2" />
            Loading test runs from IndexedDB...
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-3">
            <Layers className="w-10 h-10 mx-auto text-neutral-600" />
            <h3 className="text-sm font-semibold text-neutral-300">No test runs found</h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              {tests.length === 0
                ? 'No experiments have been run yet. Launch a test with your ESP32 board to record your first dataset.'
                : 'No tests match your active filter criteria. Try adjusting your filters or search terms.'}
            </p>
            {tests.length === 0 && (
              <Link
                href="/run-test"
                className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-lg bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Run Guided Test</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-900/50 text-neutral-400 font-mono">
                  <th className="py-3 px-4 font-medium">Test ID / Started</th>
                  <th className="py-3 px-4 font-medium">Sample ID</th>
                  <th className="py-3 px-4 font-medium">Category & Condition</th>
                  <th className="py-3 px-4 font-medium">Stage</th>
                  <th className="py-3 px-4 font-medium">Duration</th>
                  <th className="py-3 px-4 font-medium">Readings</th>
                  <th className="py-3 px-4 font-medium">Assessment</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900">
                {filteredTests.map((t) => (
                  <tr key={t.id} className="hover:bg-neutral-900/30 transition">
                    {/* Test ID & Date */}
                    <td className="py-3 px-4">
                      <div className="font-mono text-white font-semibold">{t.id}</div>
                      <div className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(t.startedAt)}</span>
                      </div>
                    </td>

                    {/* Sample ID */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-white">{t.sampleId}</span>
                      {t.operatorNotes && (
                        <p className="text-[11px] text-neutral-400 line-clamp-1 max-w-[140px] mt-0.5">
                          {t.operatorNotes}
                        </p>
                      )}
                    </td>

                    {/* Category & Condition */}
                    <td className="py-3 px-4">
                      <div className="text-neutral-200">{t.cakeCategory}</div>
                      <div className="text-[11px] text-neutral-500 capitalize">{t.storageCondition}</div>
                    </td>

                    {/* Stage */}
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
                        {t.stage}
                      </span>
                    </td>

                    {/* Duration */}
                    <td className="py-3 px-4 font-mono text-neutral-300">
                      <div>{t.actualDurationSeconds}s</div>
                      <div className="text-[10px] text-neutral-500">plan: {t.plannedDurationSeconds}s</div>
                    </td>

                    {/* Readings */}
                    <td className="py-3 px-4 font-mono">
                      <span className="text-white font-medium">{t.validReadingsCount}</span>
                      <span className="text-neutral-500"> / {t.readingsCount}</span>
                      {t.errorReadingsCount > 0 && (
                        <span className="block text-[10px] text-rose-400 font-mono">
                          {t.errorReadingsCount} err
                        </span>
                      )}
                    </td>

                    {/* Human Assessment */}
                    <td className="py-3 px-4">
                      {t.assessmentStatus === 'Submitted' || t.assessmentStatus === 'submitted' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Submitted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-500 border border-neutral-800">
                          Pending
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                          t.status === 'Completed' || t.status === 'completed'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : t.status === 'Interrupted' || t.status === 'interrupted'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : t.status === 'Running' || t.status === 'testing'
                            ? 'bg-blue-950 text-blue-400 border border-blue-800'
                            : 'bg-neutral-900 text-neutral-400 border border-neutral-700'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/results/${t.id}`}
                          className="px-2.5 py-1 rounded bg-white text-black font-semibold text-[11px] hover:bg-neutral-200 transition inline-flex items-center gap-1"
                          title="View statistical report and charts"
                        >
                          <span>Report</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                        <button
                          onClick={() => handleExportSingle(t)}
                          disabled={isExporting === t.id}
                          className="p-1.5 rounded bg-neutral-900 border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white transition disabled:opacity-50"
                          title="Download Raw Readings CSV"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-1.5 rounded bg-neutral-900 border border-neutral-800 hover:border-rose-800 text-neutral-400 hover:text-rose-400 transition"
                          title="Delete test run"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

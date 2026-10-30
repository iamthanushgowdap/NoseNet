'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Download,
  FileSpreadsheet,
  FileJson,
  Upload,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Database,
  Layers,
  ChevronRight,
  RefreshCw,
  Clock,
  Sparkles,
} from 'lucide-react';
import { TestRun } from '@/types/test-run';
import { LiveSensorReading } from '@/types/serial';
import { IndependentHumanAssessment } from '@/types/assessment';
import { idbStorage } from '@/lib/storage/indexed-db';
import { ExportService } from '@/services/export-service';
import { formatDate } from '@/lib/utils';

export default function DataExportPage() {
  const [tests, setTests] = useState<TestRun[]>([]);
  const [selectedSingleTestId, setSelectedSingleTestId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await idbStorage.getAllTestRuns();
      setTests(data);
      if (data.length > 0 && !selectedSingleTestId) {
        setSelectedSingleTestId(data[0].id);
      }
    } catch (e) {
      console.error('Failed to load tests for export:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 1. Export All Raw Readings Combined CSV
  const handleExportAllRawCsv = async () => {
    if (tests.length === 0) {
      alert('No test runs in database to export.');
      return;
    }
    setIsExporting('all_raw');
    setStatusMessage(null);
    try {
      const batch: { testRun: TestRun; readings: LiveSensorReading[] }[] = [];
      for (const t of tests) {
        const readings = await idbStorage.getReadingsForTest(t.id);
        batch.push({ testRun: t, readings });
      }

      const csv = ExportService.exportAllRawReadingsCombinedCsv(batch);
      const filename = `nosenet_all_raw_readings_${new Date().toISOString().slice(0, 10)}.csv`;
      ExportService.triggerDownload(csv, filename, 'text/csv;charset=utf-8;');
      setStatusMessage({ type: 'success', text: `Successfully exported all raw sensor readings (${batch.reduce((a, b) => a + b.readings.length, 0)} records).` });
    } catch (e: any) {
      console.error('Export failed:', e);
      setStatusMessage({ type: 'error', text: 'Export error: ' + e.message });
    } finally {
      setIsExporting(null);
    }
  };

  // 2. Export Test Runs Summary CSV
  const handleExportSummaryCsv = () => {
    if (tests.length === 0) {
      alert('No test runs in database to export.');
      return;
    }
    try {
      const csv = ExportService.exportTestRunsSummaryCsv(tests);
      const filename = `nosenet_experiments_summary_${new Date().toISOString().slice(0, 10)}.csv`;
      ExportService.triggerDownload(csv, filename, 'text/csv;charset=utf-8;');
      setStatusMessage({ type: 'success', text: `Exported summary metadata for ${tests.length} test runs.` });
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: 'Summary export error: ' + e.message });
    }
  };

  // 3. Export Assessments CSV
  const handleExportAssessmentsCsv = () => {
    const assessments = tests
      .map((t) => t.humanAssessment)
      .filter((a): a is IndependentHumanAssessment => a !== null && a !== undefined);

    if (assessments.length === 0) {
      alert('No independent human assessments have been submitted yet.');
      return;
    }

    try {
      const csv = ExportService.exportAssessmentsCsv(assessments);
      const filename = `nosenet_human_assessments_${new Date().toISOString().slice(0, 10)}.csv`;
      ExportService.triggerDownload(csv, filename, 'text/csv;charset=utf-8;');
      setStatusMessage({ type: 'success', text: `Exported ${assessments.length} independent human sensory assessments.` });
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: 'Assessments export error: ' + e.message });
    }
  };

  // 4. Export Single Test Raw Readings CSV
  const handleExportSingleTestCsv = async () => {
    const test = tests.find((t) => t.id === selectedSingleTestId);
    if (!test) return;

    setIsExporting('single_raw');
    setStatusMessage(null);
    try {
      const readings = await idbStorage.getReadingsForTest(test.id);
      const csv = ExportService.exportRawReadingsCsv(test, readings);
      const filename = `nosenet_raw_${test.id}_${test.sampleId}.csv`;
      ExportService.triggerDownload(csv, filename, 'text/csv;charset=utf-8;');
      setStatusMessage({ type: 'success', text: `Exported raw readings for test ${test.id} (${readings.length} readings).` });
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: 'Single test export error: ' + e.message });
    } finally {
      setIsExporting(null);
    }
  };

  // 5. Full Database JSON Backup
  const handleExportFullJsonBackup = async () => {
    setIsExporting('full_json');
    setStatusMessage(null);
    try {
      const backupData: {
        exportedAt: string;
        schemaVersion: string;
        testRuns: TestRun[];
        readingsMap: Record<string, LiveSensorReading[]>;
      } = {
        exportedAt: new Date().toISOString(),
        schemaVersion: '2.0.0-hardware-serial',
        testRuns: tests,
        readingsMap: {},
      };

      for (const t of tests) {
        backupData.readingsMap[t.id] = await idbStorage.getReadingsForTest(t.id);
      }

      const jsonStr = JSON.stringify(backupData, null, 2);
      const filename = `nosenet_database_backup_${new Date().toISOString().slice(0, 10)}.json`;
      ExportService.triggerDownload(jsonStr, filename, 'application/json');
      setStatusMessage({ type: 'success', text: 'Full experiment archive JSON successfully created and downloaded.' });
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: 'Backup error: ' + e.message });
    } finally {
      setIsExporting(null);
    }
  };

  // 6. Restore from JSON Backup
  const handleRestoreJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);
    setStatusMessage(null);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.testRuns || !Array.isArray(data.testRuns)) {
        throw new Error('Invalid JSON backup file: missing testRuns array.');
      }

      // Restore tests and readings into IndexedDB
      for (const test of data.testRuns) {
        await idbStorage.saveTestRun(test);
        const readings = data.readingsMap?.[test.id] || [];
        if (readings.length > 0) {
          await idbStorage.appendReadingsBatch(test.id, readings);
        }
      }

      await loadData();
      setStatusMessage({
        type: 'success',
        text: `Successfully restored ${data.testRuns.length} test runs and associated sensor readings into IndexedDB.`,
      });
    } catch (err: any) {
      console.error('Restore error:', err);
      setStatusMessage({ type: 'error', text: 'Restore error: ' + err.message });
    } finally {
      setIsRestoring(false);
      e.target.value = '';
    }
  };

  // 7. Clear Database
  const handleClearDatabase = async () => {
    const confirmText = prompt('WARNING: This will permanently delete ALL test runs and sensor readings stored locally.\n\nType "DELETE" to confirm:');
    if (confirmText !== 'DELETE') return;

    try {
      await idbStorage.clearDatabase();
      await loadData();
      setStatusMessage({ type: 'success', text: 'IndexedDB database cleared successfully.' });
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: 'Error clearing database: ' + e.message });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full bg-black text-white space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Download className="w-7 h-7 text-white" />
              <span>Data Export & Archival Center</span>
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-700 font-mono">
              CSV & JSON
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
            Export experimental data, raw BME688 serial timeseries, and independent human sensory verdicts with exact schemas for scientific analysis.
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white transition"
          title="Refresh database"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Notification Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${
            statusMessage.type === 'success'
              ? 'border-emerald-800 bg-emerald-950/30 text-emerald-300'
              : 'border-rose-800 bg-rose-950/30 text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Primary CSV Export Formats (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: All Raw Readings CSV */}
        <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-950 flex flex-col justify-between space-y-4">
          <div>
            <div className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white mb-3">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-sm text-white">All Raw Readings (Combined)</h3>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Consolidated raw timeseries of all tests matching the exact schema:
            </p>
            <div className="mt-2.5 p-2 rounded bg-black border border-neutral-900 text-[10px] font-mono text-neutral-400 break-all">
              test_id,timestamp,elapsed_ms,sequence,sample_id,cake_category,storage_condition,stage,temperature_C,humidity_percent,pressure_hPa,gas_resistance_ohm,gas_resistance_kohm,status
            </div>
          </div>
          <button
            onClick={handleExportAllRawCsv}
            disabled={isExporting === 'all_raw' || tests.length === 0}
            className="w-full py-2.5 px-4 rounded-lg bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {isExporting === 'all_raw' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Exporting Readings...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download Combined CSV</span>
              </>
            )}
          </button>
        </div>

        {/* Card 2: Tests Summary CSV */}
        <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-950 flex flex-col justify-between space-y-4">
          <div>
            <div className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white mb-3">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-sm text-white">Experiment Test Runs Summary</h3>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Metadata summary across all recorded test sessions:
            </p>
            <div className="mt-2.5 p-2 rounded bg-black border border-neutral-900 text-[10px] font-mono text-neutral-400 break-all">
              test_id,sample_id,cake_category,storage_condition,stage,status,planned_duration_sec,actual_duration_sec,started_at,readings_count,assessment_status...
            </div>
          </div>
          <button
            onClick={handleExportSummaryCsv}
            disabled={tests.length === 0}
            className="w-full py-2.5 px-4 rounded-lg bg-neutral-900 border border-neutral-700 text-white font-semibold text-xs hover:bg-neutral-800 transition flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Summary CSV</span>
          </button>
        </div>

        {/* Card 3: Assessments CSV */}
        <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-950 flex flex-col justify-between space-y-4">
          <div>
            <div className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white mb-3">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-sm text-white">Human Sensory Assessments</h3>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Verdicts submitted independently from second devices:
            </p>
            <div className="mt-2.5 p-2 rounded bg-black border border-neutral-900 text-[10px] font-mono text-neutral-400 break-all">
              assessment_id,test_id,token,visual_condition,smell_assessment,human_assessment,confidence,assessor_identifier,submitted_at...
            </div>
          </div>
          <button
            onClick={handleExportAssessmentsCsv}
            className="w-full py-2.5 px-4 rounded-lg bg-neutral-900 border border-neutral-700 text-white font-semibold text-xs hover:bg-neutral-800 transition flex items-center justify-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Assessments CSV</span>
          </button>
        </div>
      </div>

      {/* Single Test Raw Readings Export Section */}
      <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-950 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-white" />
          <span>Export Single Test Raw Readings</span>
        </h3>
        <p className="text-xs text-neutral-400">
          Select an individual experiment run to extract its isolated raw CSV readings file.
        </p>

        {tests.length === 0 ? (
          <div className="text-xs text-neutral-500 py-2">No test runs recorded yet.</div>
        ) : (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
            <select
              value={selectedSingleTestId}
              onChange={(e) => setSelectedSingleTestId(e.target.value)}
              className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-neutral-500 font-mono"
            >
              {tests.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id} — Sample: {t.sampleId} ({t.cakeCategory}, {t.storageCondition}, {t.stage}) [{t.validReadingsCount} readings]
                </option>
              ))}
            </select>

            <button
              onClick={handleExportSingleTestCsv}
              disabled={isExporting === 'single_raw' || !selectedSingleTestId}
              className="px-4 py-2 rounded-lg bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition flex items-center justify-center gap-2 shrink-0"
            >
              {isExporting === 'single_raw' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Preparing...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Test CSV</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Complete Backup & Database Management */}
      <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-950 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-white" />
            <span>IndexedDB Database Backup & Maintenance</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            Create complete JSON backups of local browser storage or restore previously archived datasets.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Download JSON Backup */}
          <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col justify-between space-y-3">
            <div>
              <div className="text-xs font-semibold text-white">Full JSON Archive</div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Complete structured dump of all test runs and raw sensor readings.
              </p>
            </div>
            <button
              onClick={handleExportFullJsonBackup}
              disabled={isExporting === 'full_json' || tests.length === 0}
              className="w-full py-2 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-white font-medium transition flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>Download JSON Backup</span>
            </button>
          </div>

          {/* Restore JSON Backup */}
          <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col justify-between space-y-3">
            <div>
              <div className="text-xs font-semibold text-white">Restore From Backup</div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Import an existing NoseNet JSON backup file into browser storage.
              </p>
            </div>
            <label className="w-full py-2 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-white font-medium transition flex items-center justify-center gap-1.5 cursor-pointer text-center">
              <Upload className="w-3.5 h-3.5" />
              <span>{isRestoring ? 'Restoring...' : 'Upload JSON File'}</span>
              <input
                type="file"
                accept=".json"
                onChange={handleRestoreJson}
                disabled={isRestoring}
                className="hidden"
              />
            </label>
          </div>

          {/* Clear Database */}
          <div className="p-4 rounded-xl border border-rose-950 bg-rose-950/20 flex flex-col justify-between space-y-3">
            <div>
              <div className="text-xs font-semibold text-rose-300">Wipe Local Database</div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Permanently purge all IndexedDB experiment test runs and readings.
              </p>
            </div>
            <button
              onClick={handleClearDatabase}
              className="w-full py-2 px-3 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-800 text-xs text-rose-300 font-medium transition flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge Local Storage</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

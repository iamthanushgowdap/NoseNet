'use client';

import React, { useState, useRef } from 'react';
import { services } from '@/services';
import { useApp } from '@/context/app-context';
import { ProjectBackupData } from '@/types/backup';
import { Button } from '@/components/common/button';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { Modal } from '@/components/common/modal';
import { formatDate } from '@/lib/utils';
import {
  Database,
  Download,
  Upload,
  Sparkles,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  FileJson,
} from 'lucide-react';

export default function BackupPage() {
  const { experiments, samples, sensorReadingsCount, assessmentsCount, refreshData } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [validatedBackup, setValidatedBackup] = useState<ProjectBackupData | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // CSV Exporters
  const downloadFile = (content: string, fileName: string, mime: string = 'text/csv') => {
    const blob = new Blob([content], { type: `${mime};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportReadingsCsv = async () => {
    const readings = await services.sensor.getReadings();
    const csv = services.sensor.exportToCsv(readings);
    downloadFile(csv, `nosenet_sensor_readings_${Date.now()}.csv`);
  };

  const handleExportAssessmentsCsv = async () => {
    const assessments = await services.assessments.getAssessments();
    const csv = services.assessments.exportToCsv(assessments);
    downloadFile(csv, `nosenet_manual_assessments_${Date.now()}.csv`);
  };

  const handleExportSamplesCsv = async () => {
    const csv = await services.backup.exportSamplesCsv();
    downloadFile(csv, `nosenet_samples_${Date.now()}.csv`);
  };

  const handleExportExperimentsCsv = async () => {
    const csv = await services.backup.exportExperimentsCsv();
    downloadFile(csv, `nosenet_experiments_${Date.now()}.csv`);
  };

  const handleExportJsonBackup = async () => {
    const backup = await services.backup.exportBackup();
    const jsonStr = JSON.stringify(backup, null, 2);
    downloadFile(jsonStr, `nosenet_backup_${Date.now()}.json`, 'application/json');
  };

  // Restore File Upload & Validation
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    try {
      const text = await file.text();
      const validation = services.backup.validateBackupFile(text);
      if (validation.isValid && validation.data) {
        setValidatedBackup(validation.data);
        setValidationErrors([]);
        setIsRestoreModalOpen(true);
      } else {
        setValidatedBackup(null);
        setValidationErrors(validation.errors);
        setIsRestoreModalOpen(true);
      }
    } catch {
      setValidationErrors(['Failed to read JSON backup file.']);
      setIsRestoreModalOpen(true);
    }
    // reset input
    e.target.value = '';
  };

  const handleConfirmRestore = async () => {
    if (!validatedBackup) return;
    setIsRestoring(true);
    try {
      const res = await services.backup.restoreBackup(validatedBackup, replaceExisting);
      setStatusMessage(res.message);
      await refreshData();
      setTimeout(() => {
        setIsRestoreModalOpen(false);
        setValidatedBackup(null);
        setStatusMessage(null);
      }, 1500);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Restore failed');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleSeedDataset = async () => {
    setIsResetting(true);
    try {
      await services.backup.seedCollegeDemoDataset();
      await refreshData();
      alert('College project demonstration dataset loaded successfully!');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to seed data');
    } finally {
      setIsResetting(false);
    }
  };

  const handleClearAllData = async () => {
    setIsResetting(true);
    try {
      await services.storage.clearAll();
      await refreshData();
      setIsResetConfirmOpen(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to clear data');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 bg-black text-white">
      {/* Header */}
      <div className="pb-6 border-b border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Database className="w-6 h-6 text-white" />
            <span>Data Export, Backup & Restoration</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Local browser storage management, validated JSON snapshots, and research CSV data exports.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSeedDataset}
          isLoading={isResetting}
          className="text-white border-neutral-700 hover:bg-neutral-900"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1 text-white" />
          <span>Load College Dataset</span>
        </Button>
      </div>

      {/* Currently Stored Data Summary */}
      <div className="p-5 rounded-lg bg-black border border-neutral-800">
        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
          Currently Persisted in Browser LocalStorage
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
            <span className="text-neutral-400 block text-[11px]">Experiments</span>
            <span className="text-base font-bold text-white">{experiments.length}</span>
          </div>
          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
            <span className="text-neutral-400 block text-[11px]">Samples</span>
            <span className="text-base font-bold text-white">{samples.length}</span>
          </div>
          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
            <span className="text-neutral-400 block text-[11px]">Sensor Data Points</span>
            <span className="text-base font-bold text-white">{sensorReadingsCount.toLocaleString()}</span>
          </div>
          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
            <span className="text-neutral-400 block text-[11px]">Manual Sensory Logs</span>
            <span className="text-base font-bold text-white">{assessmentsCount}</span>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white">1. Research Data Exports</h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Download individual CSV tables for analysis in Python (Pandas/SciPy), R, or Excel.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Sensor readings CSV */}
          <div className="p-4 rounded-lg bg-black border border-neutral-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 text-white">
                <FileSpreadsheet className="w-4 h-4 text-white" />
                <h4 className="text-xs font-bold text-white">Sensor Readings CSV</h4>
              </div>
              <p className="text-[11px] text-neutral-400 leading-snug">
                Complete ESP32 time-series: elapsed_seconds, temp, humidity, pressure, gas resistance.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportReadingsCsv}
              disabled={sensorReadingsCount === 0}
              className="mt-4 w-full"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Download Readings CSV
            </Button>
          </div>

          {/* Manual Assessments CSV */}
          <div className="p-4 rounded-lg bg-black border border-neutral-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 text-white">
                <FileSpreadsheet className="w-4 h-4 text-white" />
                <h4 className="text-xs font-bold text-white">Manual Assessments CSV</h4>
              </div>
              <p className="text-[11px] text-neutral-400 leading-snug">
                Fresh/Average/Not Good sensory labels with assessor IDs, confidence, and timestamps.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportAssessmentsCsv}
              disabled={assessmentsCount === 0}
              className="mt-4 w-full"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Download Assessments CSV
            </Button>
          </div>

          {/* Sample Metadata CSV */}
          <div className="p-4 rounded-lg bg-black border border-neutral-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 text-white">
                <FileSpreadsheet className="w-4 h-4 text-white" />
                <h4 className="text-xs font-bold text-white">Sample Metadata CSV</h4>
              </div>
              <p className="text-[11px] text-neutral-400 leading-snug">
                Cake categories (Normal vs Pastry), storage (Frozen vs Unfrozen), replicates, mass.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportSamplesCsv}
              disabled={samples.length === 0}
              className="mt-4 w-full"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Download Samples CSV
            </Button>
          </div>

          {/* Experiment Summary CSV */}
          <div className="p-4 rounded-lg bg-black border border-neutral-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 text-white">
                <FileSpreadsheet className="w-4 h-4 text-white" />
                <h4 className="text-xs font-bold text-white">Experiment Summary CSV</h4>
              </div>
              <p className="text-[11px] text-neutral-400 leading-snug">
                Protocols, test dates, planned duration, ROOM & EMPTY_CONTAINER control baselines.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportExperimentsCsv}
              disabled={experiments.length === 0}
              className="mt-4 w-full"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Download Experiments CSV
            </Button>
          </div>

          {/* Complete JSON Backup */}
          <div className="p-4 rounded-lg bg-black border border-neutral-700 flex flex-col justify-between sm:col-span-2">
            <div>
              <div className="flex items-center gap-2 mb-2 text-white">
                <FileJson className="w-4 h-4 text-white" />
                <h4 className="text-xs font-bold text-white">
                  Full Project JSON Backup Snapshot
                </h4>
              </div>
              <p className="text-[11px] text-neutral-400 leading-snug">
                Packages the entire database into a single validated JSON file with schema metadata.
                Can be restored on any computer or browser running NoseNet.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExportJsonBackup}
              className="mt-4"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Download Full Project JSON Backup
            </Button>
          </div>
        </div>
      </div>

      {/* Restore Section */}
      <div className="space-y-4 pt-4 border-t border-neutral-800">
        <div>
          <h3 className="text-sm font-bold text-white">2. Restore from JSON Backup</h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Upload a previously exported NoseNet JSON file. Zod schema validation runs before any changes are made.
          </p>
        </div>

        <div className="p-6 rounded-lg bg-black border border-dashed border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFileUpload}
          />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-700 text-white flex items-center justify-center shrink-0">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">
                Select Backup File (.json)
              </h4>
              <p className="text-[11px] text-neutral-400">
                Data will be previewed with a confirmation prompt before replacement.
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-3.5 h-3.5 mr-1" />
            <span>Browse Backup File</span>
          </Button>
        </div>
      </div>

      {/* Danger Zone: Clear Local Storage */}
      <div className="p-5 rounded-lg bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Reset Development Storage
          </h4>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Wipe all local experiments, samples, readings, and assessments from this browser.
          </p>
        </div>
        <Button
          variant="danger"
          size="sm"
          onClick={() => setIsResetConfirmOpen(true)}
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1" />
          Clear All Local Storage
        </Button>
      </div>

      {/* Restore Preview & Confirmation Modal */}
      <Modal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        title="Restore Project Backup"
        description="Verify backup metadata before applying changes."
        maxWidth="lg"
      >
        {validationErrors.length > 0 ? (
          <div className="space-y-3">
            <div className="p-3.5 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-xs">
              <div className="font-semibold mb-1 flex items-center gap-1.5 text-white">
                <AlertTriangle className="w-4 h-4 text-white" />
                <span>Backup Schema Validation Failed</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 font-mono text-[11px] text-neutral-300">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
            <div className="flex justify-end pt-3">
              <Button variant="ghost" size="sm" onClick={() => setIsRestoreModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : validatedBackup ? (
          <div className="space-y-4">
            {statusMessage && (
              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>{statusMessage}</span>
              </div>
            )}

            <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-400">Application:</span>
                <span className="font-semibold text-white">{validatedBackup.application}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Backup Version:</span>
                <span className="font-mono text-white font-bold">{validatedBackup.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Export Timestamp:</span>
                <span className="font-mono text-neutral-300">{formatDate(validatedBackup.exportedAt)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-center">
              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-400 text-[10px] block">Experiments</span>
                <span className="font-bold text-white">{validatedBackup.experiments.length}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-400 text-[10px] block">Samples</span>
                <span className="font-bold text-white">{validatedBackup.samples.length}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-400 text-[10px] block">Readings</span>
                <span className="font-bold text-white">{validatedBackup.sensorReadings.length}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-400 text-[10px] block">Assessments</span>
                <span className="font-bold text-white">{validatedBackup.manualAssessments.length}</span>
              </div>
            </div>

            {/* Replacement mode options */}
            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
                <input
                  type="checkbox"
                  checked={replaceExisting}
                  onChange={(e) => setReplaceExisting(e.target.checked)}
                  className="rounded border-neutral-700 bg-black text-white focus:ring-white"
                />
                <span className="font-medium text-white">
                  Replace all existing data (uncheck to merge instead)
                </span>
              </label>
              <p className="text-[11px] text-neutral-400 pl-6">
                {replaceExisting
                  ? 'Warning: Existing records in this browser will be wiped and replaced with the backup file.'
                  : 'Safe mode: Records with new IDs will be added, keeping existing data intact.'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsRestoreModalOpen(false)}
                disabled={isRestoring}
              >
                Cancel
              </Button>
              <Button
                variant={replaceExisting ? 'danger' : 'primary'}
                size="sm"
                onClick={handleConfirmRestore}
                isLoading={isRestoring}
              >
                {replaceExisting ? 'Confirm & Overwrite Data' : 'Confirm & Merge Data'}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Wipe Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleClearAllData}
        title="Wipe Local Database"
        description="Are you sure you want to completely erase all experiments, samples, sensor readings, and assessments from this browser's local storage? Export a JSON backup first if you wish to retain your data."
        confirmLabel="Erase Everything"
        variant="danger"
        isLoading={isResetting}
      />
    </div>
  );
}

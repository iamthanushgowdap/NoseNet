'use client';

import React, { useState, useRef } from 'react';
import { services } from '@/services';
import { CsvImportPreview } from '@/types/sensor';
import { Button } from '@/components/common/button';
import { Modal } from '@/components/common/modal';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  FileDown,
  XCircle,
} from 'lucide-react';

interface CsvUploadDropzoneProps {
  onImportComplete: () => void;
}

export function CsvUploadDropzone({ onImportComplete }: CsvUploadDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<CsvImportPreview | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv' && !file.type.includes('comma-separated-values')) {
      alert('Please upload a standard .csv file.');
      return;
    }

    setIsProcessing(true);
    try {
      const text = await file.text();
      const previewData = await services.sensor.previewCsv(text, file.name);
      setPreview(previewData);
      setIsModalOpen(true);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to parse CSV file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = async () => {
    if (!preview || preview.validRows.length === 0) return;
    setIsProcessing(true);
    try {
      const result = await services.sensor.importReadings(preview.validRows);
      setImportStatus(
        `Successfully imported ${result.importedCount} sensor readings (${result.skippedDuplicatesCount} duplicates skipped).`
      );
      setTimeout(() => {
        setIsModalOpen(false);
        setPreview(null);
        setImportStatus(null);
        onImportComplete();
      }, 1200);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Import failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadSampleCsv = () => {
    const sampleCsv = `experiment_id,sample_id,stage,sample_no,elapsed_seconds,temperature_C,humidity_percent,pressure_hPa,gas_resistance_ohm,gas_resistance_kohm,status
EXP-2026-001,SMP-NC-UF-01,ROOM,1,0,24.1,51.2,1012.5,54200,54.200,OK
EXP-2026-001,SMP-NC-UF-01,ROOM,1,5,24.1,51.3,1012.5,54300,54.300,OK
EXP-2026-001,SMP-NC-UF-01,ROOM,1,10,24.2,51.1,1012.4,54150,54.150,OK
EXP-2026-001,SMP-NC-UF-01,EMPTY_CONTAINER,1,15,24.3,51.0,1012.4,52800,52.800,OK
EXP-2026-001,SMP-NC-UF-01,EMPTY_CONTAINER,1,20,24.3,50.9,1012.4,52900,52.900,OK
EXP-2026-001,SMP-NC-UF-01,CAKE,1,25,24.5,52.5,1012.3,48500,48.500,OK
EXP-2026-001,SMP-NC-UF-01,CAKE,1,30,24.6,53.2,1012.3,45200,45.200,OK
EXP-2026-001,SMP-NC-UF-01,CAKE,1,35,24.7,53.8,1012.2,42100,42.100,OK
EXP-2026-001,SMP-NC-UF-01,CAKE,1,40,24.8,54.2,1012.2,40800,40.800,OK`;

    const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'nosenet_esp32_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg p-6 sm:p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-white bg-neutral-900'
            : 'border-neutral-800 bg-black hover:border-neutral-600 hover:bg-neutral-950'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        <div className="flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-neutral-700 text-white flex items-center justify-center mb-3">
            <Upload className="w-6 h-6" />
          </div>

          <h3 className="text-sm font-semibold text-white">
            Upload ESP32 Sensor CSV File
          </h3>
          <p className="text-xs text-neutral-400 max-w-md mt-1 mb-4 leading-relaxed">
            Drag & drop your CSV file here, or click to browse. Supports ROOM, EMPTY_CONTAINER, and CAKE stages.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3" onClick={(e) => e.stopPropagation()}>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-white" />
              Browse Computer
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDownloadSampleCsv}
              className="text-neutral-400 hover:text-white"
            >
              <FileDown className="w-3.5 h-3.5 mr-1" />
              Download ESP32 CSV Template
            </Button>
          </div>
        </div>
      </div>

      {/* Validation & Preview Modal */}
      {preview && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`CSV Import Preview: ${preview.fileName}`}
          description="Review parsed columns, detected experiment/sample keys, and validation errors before importing."
          maxWidth="2xl"
        >
          <div className="space-y-4">
            {importStatus && (
              <div className="p-3.5 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
                <span>{importStatus}</span>
              </div>
            )}

            {/* Summary Stat Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-black border border-neutral-800">
                <span className="text-neutral-400 block text-[11px]">Total Rows</span>
                <span className="font-bold text-white text-base">{preview.totalRows}</span>
              </div>
              <div className="p-3 rounded-lg bg-black border border-neutral-700">
                <span className="text-white block text-[11px]">Valid Readings</span>
                <span className="font-bold text-white text-base">{preview.validRows.length}</span>
              </div>
              <div className="p-3 rounded-lg bg-black border border-neutral-800">
                <span className="text-neutral-400 block text-[11px]">Duplicates (Skipped)</span>
                <span className="font-bold text-neutral-300 text-base">{preview.duplicateCount}</span>
              </div>
              <div className="p-3 rounded-lg bg-black border border-neutral-700">
                <span className="text-neutral-400 block text-[11px]">Invalid Rows</span>
                <span className="font-bold text-neutral-200 text-base">{preview.invalidRows.length}</span>
              </div>
            </div>

            {/* Detected metadata */}
            <div className="p-3 rounded-lg bg-black border border-neutral-800 text-xs space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-neutral-400">Experiments Detected:</span>
                <span className="font-mono text-white font-semibold">
                  {preview.detectedExperimentIds.join(', ') || 'None'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neutral-400">Samples Detected:</span>
                <span className="font-mono text-white font-semibold">
                  {preview.detectedSampleIds.join(', ') || 'None'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neutral-400">Stages Present:</span>
                <span className="font-mono text-neutral-200">
                  {preview.detectedStages.join(', ') || 'None'}
                </span>
              </div>
            </div>

            {/* Invalid rows warning */}
            {preview.invalidRows.length > 0 && (
              <div className="p-3.5 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <XCircle className="w-4 h-4 shrink-0 text-white" />
                  <span>{preview.invalidRows.length} rows failed schema validation</span>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1 font-mono text-[11px] text-neutral-300 pr-1">
                  {preview.invalidRows.slice(0, 10).map((inv, idx) => (
                    <div key={idx} className="bg-black p-1.5 rounded border border-neutral-800">
                      Row {inv.rowNumber}: {inv.errors.join('; ')}
                    </div>
                  ))}
                  {preview.invalidRows.length > 10 && (
                    <div className="text-neutral-500 text-center py-1">
                      ...and {preview.invalidRows.length - 10} more invalid rows
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sample preview table */}
            {preview.validRows.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-2">
                  First 3 Valid Rows
                </h4>
                <div className="overflow-x-auto border border-neutral-800 rounded-lg bg-black">
                  <table className="w-full text-left text-[11px] font-mono">
                    <thead className="bg-neutral-950 text-neutral-300 border-b border-neutral-800 font-bold">
                      <tr>
                        <th className="p-2">Stage</th>
                        <th className="p-2">Elapsed (s)</th>
                        <th className="p-2">Temp (°C)</th>
                        <th className="p-2">RH (%)</th>
                        <th className="p-2">Gas (kΩ)</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800 text-white">
                      {preview.validRows.slice(0, 3).map((r, i) => (
                        <tr key={i}>
                          <td className="p-2 font-semibold text-white">{r.stage}</td>
                          <td className="p-2">{r.elapsedSeconds}</td>
                          <td className="p-2">{r.temperatureC}</td>
                          <td className="p-2">{r.humidityPercent}</td>
                          <td className="p-2 font-bold text-white">{r.gasResistanceKohm}</td>
                          <td className="p-2">{r.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmImport}
                disabled={preview.validRows.length === 0 || isProcessing}
                isLoading={isProcessing}
              >
                Confirm & Import {preview.validRows.length} Readings
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

'use client';

import React, { useState } from 'react';
import { SensorReading } from '@/types/sensor';
import { StatusBadge } from '@/components/common/badge';
import { Button } from '@/components/common/button';
import { services } from '@/services';
import { formatNumber } from '@/lib/utils';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';

interface SensorDataTableProps {
  readings: SensorReading[];
  onClearAll?: () => void;
}

export function SensorDataTable({ readings, onClearAll }: SensorDataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const totalPages = Math.ceil(readings.length / pageSize) || 1;
  const paginatedReadings = readings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleExport = () => {
    const csv = services.sensor.exportToCsv(readings);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nosenet_sensor_readings_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            Raw Sensor Readings Data Table
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Showing {readings.length} data points with verified ESP32 columns.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={readings.length === 0}
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            <span>Export Filtered CSV</span>
          </Button>

          {onClearAll && readings.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              onClick={onClearAll}
              className="text-xs"
            >
              Clear Stored Data
            </Button>
          )}
        </div>
      </div>

      {readings.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500">
          No readings to display in table.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Stage</th>
                  <th className="py-2.5 px-3">Elapsed (s)</th>
                  <th className="py-2.5 px-3">Temp (°C)</th>
                  <th className="py-2.5 px-3">RH (%)</th>
                  <th className="py-2.5 px-3">Pressure (hPa)</th>
                  <th className="py-2.5 px-3">Gas (Ω)</th>
                  <th className="py-2.5 px-3">Gas (kΩ)</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Sample</th>
                  <th className="py-2.5 px-3">Experiment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {paginatedReadings.map((r, i) => (
                  <tr key={r.id || i} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3">
                      <StatusBadge status={r.stage} />
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-100">{r.elapsedSeconds}</td>
                    <td className="py-2.5 px-3 text-orange-400">{formatNumber(r.temperatureC, 2)}</td>
                    <td className="py-2.5 px-3 text-blue-400">{formatNumber(r.humidityPercent, 2)}%</td>
                    <td className="py-2.5 px-3 text-purple-400">{formatNumber(r.pressureHpa, 1)}</td>
                    <td className="py-2.5 px-3 text-slate-400">{r.gasResistanceOhm.toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-bold text-cyan-400">{formatNumber(r.gasResistanceKohm, 3)}</td>
                    <td className="py-2.5 px-3 text-slate-400">{r.status}</td>
                    <td className="py-2.5 px-3 text-slate-400">{r.sampleId}</td>
                    <td className="py-2.5 px-3 text-slate-500">{r.experimentId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
            <span>
              Page {currentPage} of {totalPages} ({readings.length} total rows)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

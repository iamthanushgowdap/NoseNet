'use client';

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { services } from '@/services';
import { useApp } from '@/context/app-context';
import { SensorReading, SensorStage } from '@/types/sensor';
import { MovingAveragePoint } from '@/services/sensor-service';
import { CsvUploadDropzone } from '@/components/sensor/csv-upload-dropzone';
import { SensorTimeseriesChart } from '@/components/charts/sensor-timeseries-chart';
import { SensorDataTable } from '@/components/sensor/sensor-data-table';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { LineChart, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/common/button';

function SensorContent() {
  const searchParams = useSearchParams();
  const urlExpId = searchParams.get('experimentId');
  const urlSmpId = searchParams.get('sampleId');

  const { refreshData } = useApp();

  const [filterExp, setFilterExp] = useState<string>(urlExpId || 'ALL');
  const [filterSample, setFilterSample] = useState<string>(urlSmpId || 'ALL');
  const [filterStage, setFilterStage] = useState<SensorStage | 'ALL'>('ALL');

  const [availableExperiments, setAvailableExperiments] = useState<string[]>([]);
  const [availableSamples, setAvailableSamples] = useState<string[]>([]);

  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [showSMA, setShowSMA] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const opts = await services.sensor.getFilterOptions();
      setAvailableExperiments(opts.experiments);
      setAvailableSamples(opts.samples);

      const data = await services.sensor.getReadings({
        experimentId: filterExp,
        sampleId: filterSample,
        stage: filterStage,
      });
      setReadings(data);
    } catch (e) {
      console.error('Failed to load sensor readings:', e);
    } finally {
      setIsLoading(false);
    }
  }, [filterExp, filterSample, filterStage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const chartData = useMemo<MovingAveragePoint[]>(() => {
    return services.sensor.calculateMovingAverages(readings, 5);
  }, [readings]);

  const handleClearAll = async () => {
    await services.sensor.clearAllReadings();
    await refreshData();
    await loadData();
    setIsClearModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6 bg-black text-white">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <LineChart className="w-6 h-6 text-white" />
            <span>Sensor Ingestion & Visualizations</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Recharts time-series analytics for ESP32 metal oxide gas resistance, temperature, humidity, and barometric pressure.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading}>
          <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </Button>
      </div>

      {/* CSV Upload Dropzone */}
      <CsvUploadDropzone
        onImportComplete={async () => {
          await refreshData();
          await loadData();
        }}
      />

      {/* Filter Toolbar */}
      <div className="bg-black border border-neutral-800 rounded-lg p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-white shrink-0" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Graph Filters:
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 max-w-2xl">
          {/* Experiment Filter */}
          <div>
            <select
              value={filterExp}
              onChange={(e) => setFilterExp(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-black border border-neutral-800 text-xs text-white focus:outline-none focus:border-white font-mono"
            >
              <option value="ALL" className="bg-black text-white">All Experiments</option>
              {availableExperiments.map((id) => (
                <option key={id} value={id} className="bg-black text-white">
                  Exp: {id}
                </option>
              ))}
            </select>
          </div>

          {/* Sample Filter */}
          <div>
            <select
              value={filterSample}
              onChange={(e) => setFilterSample(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-black border border-neutral-800 text-xs text-white focus:outline-none focus:border-white font-mono"
            >
              <option value="ALL" className="bg-black text-white">All Samples</option>
              {availableSamples.map((id) => (
                <option key={id} value={id} className="bg-black text-white">
                  Sample: {id}
                </option>
              ))}
            </select>
          </div>

          {/* Stage Filter */}
          <div>
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value as SensorStage | 'ALL')}
              className="w-full px-3 py-2 rounded-lg bg-black border border-neutral-800 text-xs text-white focus:outline-none focus:border-white"
            >
              <option value="ALL" className="bg-black text-white">All Stages (ROOM + CONT + CAKE)</option>
              <option value="ROOM" className="bg-black text-white">ROOM Stage Baseline</option>
              <option value="EMPTY_CONTAINER" className="bg-black text-white">EMPTY_CONTAINER Baseline</option>
              <option value="CAKE" className="bg-black text-white">CAKE Headspace Testing</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recharts Interactive Graph Card */}
      <SensorTimeseriesChart
        data={chartData}
        showSMA={showSMA}
        onToggleSMA={() => setShowSMA(!showSMA)}
      />

      {/* Data Table alongside charts */}
      <SensorDataTable
        readings={readings}
        onClearAll={readings.length > 0 ? () => setIsClearModalOpen(true) : undefined}
      />

      {/* Clear Readings Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleClearAll}
        title="Clear Stored Sensor Readings"
        description="Are you sure you want to remove all imported ESP32 sensor readings from local storage? This action cannot be undone."
        confirmLabel="Clear Data"
        variant="danger"
      />
    </div>
  );
}

export default function SensorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-neutral-400">Loading sensor analytics...</div>}>
      <SensorContent />
    </Suspense>
  );
}

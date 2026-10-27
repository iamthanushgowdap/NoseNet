'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { MovingAveragePoint } from '@/services/sensor-service';
import { formatNumber } from '@/lib/utils';
import { LineChart as ChartIcon, Zap, Thermometer, Droplets, Gauge } from 'lucide-react';

interface SensorTimeseriesChartProps {
  data: MovingAveragePoint[];
  showSMA: boolean;
  onToggleSMA: () => void;
}

type MetricType = 'gas' | 'temperature' | 'humidity' | 'pressure';

interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string | number;
  rawKey: string;
  smaKey: string;
  unit: string;
  showSMA: boolean;
}

function CustomTooltip({
  active,
  payload,
  label,
  rawKey,
  smaKey,
  unit,
  showSMA,
}: TooltipProps) {
  if (active && payload && payload.length) {
    const point = payload[0].payload as MovingAveragePoint;
    return (
      <div className="bg-slate-950 border border-slate-700/80 p-3 rounded-xl shadow-xl text-xs space-y-1">
        <div className="flex items-center justify-between gap-3 font-semibold pb-1 border-b border-slate-800">
          <span className="text-slate-300">Elapsed: {label}s</span>
          <span
            className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
              point.stage === 'ROOM'
                ? 'bg-sky-950 text-sky-300 border border-sky-800'
                : point.stage === 'EMPTY_CONTAINER'
                ? 'bg-purple-950 text-purple-300 border border-purple-800'
                : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
            }`}
          >
            {point.stage}
          </span>
        </div>

        <div className="pt-1 space-y-1 font-mono">
          <div className="text-slate-200">
            <span className="text-slate-400 font-sans mr-2">Raw Measurement:</span>
            <strong className="text-cyan-400">
              {formatNumber((point as any)[rawKey])} {unit}
            </strong>
          </div>

          {showSMA && (
            <div className="text-slate-300">
              <span className="text-slate-400 font-sans mr-2">SMA-5 (Moving Avg):</span>
              <span className="text-sky-300">
                {formatNumber((point as any)[smaKey])} {unit}
              </span>
            </div>
          )}

          <div className="text-slate-500 text-[10px] font-sans pt-1 border-t border-slate-800/80">
            Sample: {point.sampleId} | Exp: {point.experimentId}
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export function SensorTimeseriesChart({
  data,
  showSMA,
  onToggleSMA,
}: SensorTimeseriesChartProps) {
  const [activeMetric, setActiveMetric] = useState<MetricType>('gas');

  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex flex-col items-center justify-center text-center p-6 border border-slate-800 rounded-2xl bg-slate-900/40">
        <ChartIcon className="w-8 h-8 text-slate-600 mb-2" />
        <h4 className="text-sm font-semibold text-slate-300">No Sensor Readings to Plot</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Select a sample with imported readings or upload a CSV file above.
        </p>
      </div>
    );
  }

  const metricConfigs = {
    gas: {
      label: 'Gas Resistance',
      unit: 'kΩ',
      rawKey: 'gasResistanceKohm',
      smaKey: 'smaGasKohm',
      color: '#06b6d4',
      smaColor: '#38bdf8',
      domain: ['auto', 'auto'],
      icon: Zap,
    },
    temperature: {
      label: 'Temperature',
      unit: '°C',
      rawKey: 'temperatureC',
      smaKey: 'smaTempC',
      color: '#f97316',
      smaColor: '#fb923c',
      domain: ['auto', 'auto'],
      icon: Thermometer,
    },
    humidity: {
      label: 'Relative Humidity',
      unit: '%',
      rawKey: 'humidityPercent',
      smaKey: 'smaHumidity',
      color: '#3b82f6',
      smaColor: '#60a5fa',
      domain: [0, 100],
      icon: Droplets,
    },
    pressure: {
      label: 'Barometric Pressure',
      unit: 'hPa',
      rawKey: 'pressureHpa',
      smaKey: 'smaPressureHpa',
      color: '#a855f7',
      smaColor: '#c084fc',
      domain: ['auto', 'auto'],
      icon: Gauge,
    },
  };

  const currentConfig = metricConfigs[activeMetric];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
      {/* Chart Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        {/* Metric Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(['gas', 'temperature', 'humidity', 'pressure'] as MetricType[]).map((key) => {
            const config = metricConfigs[key];
            const Icon = config.icon;
            const isSelected = activeMetric === key;
            return (
              <button
                key={key}
                onClick={() => setActiveMetric(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-slate-800 text-cyan-300 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>

        {/* Moving average toggle & legend info */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            onClick={onToggleSMA}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
              showSMA
                ? 'bg-sky-950/60 text-sky-300 border-sky-800/60'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Calculate 5-point Simple Moving Average"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                showSMA ? 'bg-sky-400 animate-pulse' : 'bg-slate-600'
              }`}
            />
            <span>SMA-5 Overlay: {showSMA ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Actual Recharts Chart */}
      <div className="h-80 sm:h-96 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="elapsedSeconds"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              label={{
                value: 'Elapsed Time (seconds)',
                position: 'insideBottom',
                offset: -10,
                fill: '#64748b',
                fontSize: 11,
              }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              domain={currentConfig.domain as any}
              label={{
                value: `${currentConfig.label} (${currentConfig.unit})`,
                angle: -90,
                position: 'insideLeft',
                offset: 5,
                fill: '#64748b',
                fontSize: 11,
              }}
            />
            <Tooltip
              content={
                <CustomTooltip
                  rawKey={currentConfig.rawKey}
                  smaKey={currentConfig.smaKey}
                  unit={currentConfig.unit}
                  showSMA={showSMA}
                />
              }
            />
            <Legend
              verticalAlign="top"
              height={36}
              wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
            />

            {/* Raw sensor readings series */}
            <Line
              type="monotone"
              dataKey={currentConfig.rawKey}
              name={`Raw ${currentConfig.label} (${currentConfig.unit})`}
              stroke={currentConfig.color}
              strokeWidth={2}
              dot={{ r: 2, fill: currentConfig.color }}
              activeDot={{ r: 5 }}
            />

            {/* Optional Moving Average line */}
            {showSMA && (
              <Line
                type="monotone"
                dataKey={currentConfig.smaKey}
                name={`Calculated SMA-5 (${currentConfig.unit})`}
                stroke={currentConfig.smaColor}
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stage Legend and Note */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-400">Tested Stages:</span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-sky-400" /> ROOM Baseline
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-purple-400" /> EMPTY_CONTAINER Baseline
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400" /> CAKE Headspace Response
          </span>
        </div>

        <div>
          * Raw measurements preserved without fabrication or interpolation.
        </div>
      </div>
    </div>
  );
}

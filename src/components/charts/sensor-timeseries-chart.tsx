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
      <div className="bg-black border border-neutral-700 p-3 rounded-lg shadow-2xl text-xs space-y-1 text-white">
        <div className="flex items-center justify-between gap-3 font-semibold pb-1 border-b border-neutral-800">
          <span className="text-white">Elapsed: {label}s</span>
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
              point.stage === 'ROOM'
                ? 'bg-neutral-900 text-white border-neutral-700'
                : point.stage === 'EMPTY_CONTAINER'
                ? 'bg-neutral-900 text-neutral-300 border-neutral-700'
                : 'bg-white text-black border-white font-bold'
            }`}
          >
            {point.stage}
          </span>
        </div>

        <div className="pt-1 space-y-1 font-mono">
          <div className="text-white">
            <span className="text-neutral-400 font-sans mr-2">Raw Measurement:</span>
            <strong className="text-white">
              {formatNumber((point as any)[rawKey])} {unit}
            </strong>
          </div>

          {showSMA && (
            <div className="text-neutral-300">
              <span className="text-neutral-400 font-sans mr-2">SMA-5 (Moving Avg):</span>
              <span className="text-white">
                {formatNumber((point as any)[smaKey])} {unit}
              </span>
            </div>
          )}

          <div className="text-neutral-400 text-[10px] font-sans pt-1 border-t border-neutral-800">
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
      <div className="h-80 flex flex-col items-center justify-center text-center p-6 border border-neutral-800 rounded-lg bg-black text-white">
        <ChartIcon className="w-8 h-8 text-neutral-500 mb-2" />
        <h4 className="text-sm font-semibold text-white">No Sensor Readings to Plot</h4>
        <p className="text-xs text-neutral-400 mt-1 max-w-sm">
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
      color: '#ffffff',
      smaColor: '#a3a3a3',
      domain: ['auto', 'auto'],
      icon: Zap,
    },
    temperature: {
      label: 'Temperature',
      unit: '°C',
      rawKey: 'temperatureC',
      smaKey: 'smaTempC',
      color: '#ffffff',
      smaColor: '#a3a3a3',
      domain: ['auto', 'auto'],
      icon: Thermometer,
    },
    humidity: {
      label: 'Relative Humidity',
      unit: '%',
      rawKey: 'humidityPercent',
      smaKey: 'smaHumidity',
      color: '#ffffff',
      smaColor: '#a3a3a3',
      domain: [0, 100],
      icon: Droplets,
    },
    pressure: {
      label: 'Barometric Pressure',
      unit: 'hPa',
      rawKey: 'pressureHpa',
      smaKey: 'smaPressureHpa',
      color: '#ffffff',
      smaColor: '#a3a3a3',
      domain: ['auto', 'auto'],
      icon: Gauge,
    },
  };

  const currentConfig = metricConfigs[activeMetric];

  return (
    <div className="bg-black border border-neutral-800 rounded-lg p-5 sm:p-6 space-y-5 text-white">
      {/* Chart Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        {/* Metric Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {(['gas', 'temperature', 'humidity', 'pressure'] as MetricType[]).map((key) => {
            const config = metricConfigs[key];
            const Icon = config.icon;
            const isSelected = activeMetric === key;
            return (
              <button
                key={key}
                onClick={() => setActiveMetric(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-white text-black shadow'
                    : 'bg-black text-neutral-300 border border-neutral-800 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-black' : 'text-neutral-400'}`} />
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>

        {/* Moving average toggle & legend info */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            onClick={onToggleSMA}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showSMA
                ? 'bg-neutral-900 text-white border-neutral-600'
                : 'bg-black text-neutral-400 border-neutral-800 hover:text-white'
            }`}
            title="Calculate 5-point Simple Moving Average"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                showSMA ? 'bg-white animate-pulse' : 'bg-neutral-600'
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
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis
              dataKey="elapsedSeconds"
              stroke="#737373"
              fontSize={11}
              tickLine={false}
              tick={{ fill: '#a3a3a3' }}
              label={{
                value: 'Elapsed Time (seconds)',
                position: 'insideBottom',
                offset: -10,
                fill: '#ffffff',
                fontSize: 11,
              }}
            />
            <YAxis
              stroke="#737373"
              fontSize={11}
              tickLine={false}
              tick={{ fill: '#a3a3a3' }}
              domain={currentConfig.domain as any}
              label={{
                value: `${currentConfig.label} (${currentConfig.unit})`,
                angle: -90,
                position: 'insideLeft',
                offset: 5,
                fill: '#ffffff',
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
              wrapperStyle={{ fontSize: '11px', color: '#ffffff' }}
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
      <div className="pt-2 border-t border-neutral-800 flex flex-wrap items-center justify-between text-[11px] text-neutral-400 gap-2">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-white">Tested Stages:</span>
          <span className="flex items-center gap-1.5 text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-neutral-400" /> ROOM Baseline
          </span>
          <span className="flex items-center gap-1.5 text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-neutral-500" /> EMPTY_CONTAINER Baseline
          </span>
          <span className="flex items-center gap-1.5 text-white font-semibold">
            <span className="w-2 h-2 rounded-full bg-white" /> CAKE Headspace Response
          </span>
        </div>

        <div className="text-neutral-400">
          * Raw measurements preserved without fabrication or interpolation.
        </div>
      </div>
    </div>
  );
}

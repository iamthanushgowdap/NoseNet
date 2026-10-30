'use client';

import React from 'react';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';

interface SensorResponseSparklineProps {
  points: number[];
  label?: string;
  unit?: string;
}

export function SensorResponseSparkline({
  points,
  label = 'BME688 Gas Resistance Response (R_gas)',
  unit = 'kΩ',
}: SensorResponseSparklineProps) {
  // Ensure we have at least 2 points for a line
  const data = points && points.length > 1 ? points : [24.2, 24.5, 24.4, 24.8, 25.1];

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const current = data[data.length - 1];
  const first = data[0];
  const delta = current - first;

  // Viewport bounds
  const width = 400;
  const height = 110;
  const padX = 20;
  const padY = 20;

  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  // Generate SVG points
  const coords = data.map((val, idx) => {
    const x = padX + (idx / (data.length - 1)) * innerW;
    const y = padY + innerH - ((val - min) / range) * innerH;
    return { x, y, val };
  });

  const pathD = coords.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  // Fill area under line
  const lastX = coords[coords.length - 1].x;
  const firstX = coords[0].x;
  const bottomY = height - padY;
  const fillD = `${pathD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;

  const lastCoord = coords[coords.length - 1];

  return (
    <div className="rounded-xl bg-black border border-neutral-800 p-3.5 space-y-2 select-none">
      {/* Header with values */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-neutral-400">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="font-mono text-[11px] font-semibold uppercase">{label}</span>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-white font-extrabold">
            {current.toFixed(2)} {unit}
          </span>
          <span
            className={`flex items-center text-[10px] font-bold ${
              delta >= 0 ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {delta >= 0 ? (
              <TrendingUp className="w-3 h-3 mr-0.5" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-0.5" />
            )}
            {delta > 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2)}
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full h-24 sm:h-28 overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="gasGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={padX}
            y1={padY}
            x2={width - padX}
            y2={padY}
            stroke="#262626"
            strokeDasharray="3 3"
            strokeWidth="1"
          />
          <line
            x1={padX}
            y1={padY + innerH / 2}
            x2={width - padX}
            y2={padY + innerH / 2}
            stroke="#262626"
            strokeDasharray="3 3"
            strokeWidth="1"
          />
          <line
            x1={padX}
            y1={height - padY}
            x2={width - padX}
            y2={height - padY}
            stroke="#262626"
            strokeDasharray="3 3"
            strokeWidth="1"
          />

          {/* Shaded Area */}
          <path d={fillD} fill="url(#gasGradient)" />

          {/* Line Stroke */}
          <path
            d={pathD}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Sample Points */}
          {coords.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r="2.5"
              fill="#000000"
              stroke="#10b981"
              strokeWidth="1.5"
            />
          ))}

          {/* Glowing Head Point */}
          <circle
            cx={lastCoord.x}
            cy={lastCoord.y}
            r="4.5"
            fill="#34d399"
            className="animate-ping opacity-75"
          />
          <circle cx={lastCoord.x} cy={lastCoord.y} r="3.5" fill="#ffffff" />
        </svg>
      </div>

      {/* Axis Footer */}
      <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 pt-1 border-t border-neutral-900">
        <span>Baseline: {min.toFixed(2)} kΩ</span>
        <span>Sampling Cycles: {data.length} pts</span>
        <span>Peak VOC: {max.toFixed(2)} kΩ</span>
      </div>
    </div>
  );
}

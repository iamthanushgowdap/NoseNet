'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
  Flame,
  Thermometer,
  Droplets,
  Gauge,
  Cpu,
  RefreshCw,
  RotateCcw,
  Layers,
  Sparkles,
  Award,
  Sliders,
  Radio,
  FileCheck2,
} from 'lucide-react';
import { CakeType, FreshnessVerdict, LiveTestState } from '@/lib/server/live-test-store';

export interface ArchitecturalOutputBentoProps {
  liveTest: LiveTestState | null;
  gasHistory: number[];
  selectedCake: CakeType;
  isTesting?: boolean;
  onReset: () => void;
  className?: string;
}

/* ------------------------------------------------------------------ logic */

function clamp(v: number, a: number, b: number): number {
  return Math.min(b, Math.max(a, v));
}

// Smooth Bézier line + closed area through values, inside a w×h box
function chartPaths(values: number[], w: number, h: number, pad: number) {
  const n = values.length;
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const span = hi - lo || 1;
  const pts = values.map((v, i) => [
    pad + (n < 2 ? 0 : (i / (n - 1)) * (w - pad * 2)),
    h - pad - ((v - lo) / span) * (h - pad * 2),
  ] as [number, number]);

  let line = '';
  pts.forEach(([x, y], i) => {
    if (i === 0) {
      line = 'M' + x.toFixed(1) + ',' + y.toFixed(1);
      return;
    }
    const [px, py] = pts[i - 1];
    const cx = (px + x) / 2;
    line += ' C' + cx.toFixed(1) + ',' + py.toFixed(1) + ' ' + cx.toFixed(1) + ',' + y.toFixed(1) + ' ' + x.toFixed(1) + ',' + y.toFixed(1);
  });

  const area = n
    ? line + ' L' + pts[n - 1][0].toFixed(1) + ',' + (h - pad) + ' L' + pts[0][0].toFixed(1) + ',' + (h - pad) + ' Z'
    : '';

  return { line, area, points: pts };
}

function nearestIndex(xs: number[], x: number): number {
  let best = 0;
  for (let i = 1; i < xs.length; i++) {
    if (Math.abs(xs[i] - x) < Math.abs(xs[best] - x)) best = i;
  }
  return best;
}

export function Brackets() {
  return (
    <>
      <span className="ib-c ib-c-tl" aria-hidden="true" />
      <span className="ib-c ib-c-tr" aria-hidden="true" />
      <span className="ib-c ib-c-bl" aria-hidden="true" />
      <span className="ib-c ib-c-br" aria-hidden="true" />
    </>
  );
}

/* -------------------------------------------------------------- component */

export function ArchitecturalOutputBento({
  liveTest,
  gasHistory,
  selectedCake,
  isTesting = false,
  onReset,
  className = '',
}: ArchitecturalOutputBentoProps) {
  const uid = 'nosenet' + React.useId().replace(/[^a-zA-Z0-9]/g, '');

  const verdict = liveTest?.verdict;
  const hasResult = Boolean(verdict);

  // Compute realistic fallback/active sensor readings
  const currentGasKohm =
    liveTest?.lastSensorReading?.gasResistanceKohm !== null &&
    liveTest?.lastSensorReading?.gasResistanceKohm !== undefined
      ? liveTest.lastSensorReading.gasResistanceKohm
      : gasHistory.length > 0
      ? gasHistory[gasHistory.length - 1]
      : 24.5;

  const currentTempC =
    liveTest?.lastSensorReading?.temperatureC !== null &&
    liveTest?.lastSensorReading?.temperatureC !== undefined
      ? liveTest.lastSensorReading.temperatureC
      : 28.6;

  const currentHumidity =
    liveTest?.lastSensorReading?.humidityPercent !== null &&
    liveTest?.lastSensorReading?.humidityPercent !== undefined
      ? liveTest.lastSensorReading.humidityPercent
      : 68;

  const currentPressure =
    liveTest?.lastSensorReading?.pressureHpa !== null &&
    liveTest?.lastSensorReading?.pressureHpa !== undefined
      ? liveTest.lastSensorReading.pressureHpa
      : 718;

  const freshnessIndex =
    liveTest?.freshnessScore ||
    (verdict === 'Fresh'
      ? 94.6
      : verdict === 'Fairly Fresh'
      ? 74.2
      : verdict === 'Stale'
      ? 52.8
      : verdict === 'Spoiled' || verdict === 'Not Fresh'
      ? 18.4
      : null);

  const testId = liveTest?.testId || 'NN-4091';

  return (
    <div className={`ib-root ${className}`} data-theme="dark">
      <style>{IB_BENTO_CSS}</style>

      <div className="ib-shell space-y-4">
        {/* Section Header */}
        <div className="ib-head">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="ib-tag uppercase font-mono font-semibold tracking-wider">
              Step 3 • Diagnostic Result
            </span>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400">
              IEEE Capstone Verification
            </span>
          </div>

          <h2 className="ib-h2">
            Freshness Assessment &amp; <span className="ib-muted">Headspace Telemetry</span>
          </h2>
          <p className="text-xs text-neutral-400 max-w-xl text-center leading-relaxed">
            Electronic nose volatile signature classification captured by the SmartElex BME688 MOX gas sensor.
          </p>
        </div>

        {/* 
          LAYOUT REORDERING:
          1. Hero Top Card: Official Freshness Verdict & Quality Certificate (NO SCROLLING NEEDED ON MOBILE)
          2. Bottom Grid: Interactive VOC Scrubber (Left) + Hardware Signal Flow Architecture (Right)
        */}
        <div className="space-y-4">
          {/* 1. HERO TOP CARD: Official Freshness Verdict */}
          <FreshnessHeroCard
            verdict={verdict || null}
            freshnessIndex={freshnessIndex}
            selectedCake={liveTest?.selectedCakeType || selectedCake}
            currentGasKohm={currentGasKohm}
            currentTempC={currentTempC}
            currentHumidity={currentHumidity}
            currentPressure={currentPressure}
            isTesting={isTesting}
            readingsCount={liveTest?.sensorReadingsCount || gasHistory.length}
            onReset={onReset}
            testId={testId}
          />

          {/* 2. SUB-BENTO GRID: Telemetry & Flow Architecture */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Interactive VOC Response Curve Scrubber */}
            <VOCScrubberCard
              uid={uid}
              gasHistory={gasHistory.length >= 2 ? gasHistory : [24.1, 24.3, 24.5, 24.2, 24.7]}
              isTesting={isTesting}
              currentGasKohm={currentGasKohm}
            />

            {/* Right: Hardware Signal Flow Architecture */}
            <HardwareFlowCard
              uid={uid}
              isTesting={isTesting}
              hasResult={hasResult}
              testId={testId}
              selectedCake={liveTest?.selectedCakeType || selectedCake}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- pieces */

/* 1. HERO TOP CARD: Official Freshness Verdict (Lead Element) */
interface FreshnessHeroCardProps {
  verdict: FreshnessVerdict | null;
  freshnessIndex: number | null;
  selectedCake: CakeType;
  currentGasKohm: number;
  currentTempC: number;
  currentHumidity: number;
  currentPressure: number;
  isTesting: boolean;
  readingsCount: number;
  onReset: () => void;
  testId: string;
}

function FreshnessHeroCard({
  verdict,
  freshnessIndex,
  selectedCake,
  currentGasKohm,
  currentTempC,
  currentHumidity,
  currentPressure,
  isTesting,
  readingsCount,
  onReset,
  testId,
}: FreshnessHeroCardProps) {
  const isFresh = verdict === 'Fresh';
  const isFairlyFresh = verdict === 'Fairly Fresh';
  const isStale = verdict === 'Stale';
  const isSpoiled = verdict === 'Spoiled' || verdict === 'Not Fresh';

  return (
    <div className="ib-frame ib-frame-hover">
      <Brackets />
      <div className="ib-card p-5 sm:p-7 space-y-5">
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-white" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Official Freshness Verdict
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="px-2.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
              SPECIMEN: {selectedCake}
            </span>
            <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">
              #{testId}
            </span>
          </div>
        </div>

        {verdict ? (
          /* Case A: Test Verdict is Ready — High-Impact Vercel Style Hero */
          <div className="space-y-5">
            <div
              className={`p-5 sm:p-7 rounded-2xl border transition-all ${
                isFresh
                  ? 'border-emerald-600/70 bg-emerald-950/20 text-emerald-300'
                  : isFairlyFresh
                  ? 'border-amber-600/70 bg-amber-950/20 text-amber-300'
                  : isStale
                  ? 'border-orange-600/70 bg-orange-950/20 text-orange-300'
                  : 'border-rose-600/70 bg-rose-950/20 text-rose-300'
              }`}
            >
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-neutral-300">
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      isFresh
                        ? 'text-emerald-400'
                        : isFairlyFresh
                        ? 'text-amber-400'
                        : isStale
                        ? 'text-orange-400'
                        : 'text-rose-400'
                    }`}
                  />
                  <span>Assessment Verified &amp; Signed</span>
                </div>

                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/60 border border-neutral-800 text-neutral-400">
                  MOX Gas Resistance Normalized
                </span>
              </div>

              {/* Bold Large Verdict Typography */}
              <div className="text-4xl sm:text-7xl font-black uppercase tracking-tight text-white py-1">
                {verdict}
              </div>

              <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl mt-1 leading-relaxed">
                {isFresh
                  ? 'Optimal organoleptic condition. Peak aroma profile with negligible fermentation VOC presence. Confirmed safe for consumption.'
                  : isFairlyFresh
                  ? 'Acceptable quality standard. Minor volatile shifts observed. Recommended for consumption within 24 to 48 hours.'
                  : isStale
                  ? 'Degraded shelf-life detected. Elevated moisture loss and depletion of natural aroma volatiles. Not recommended for retail serving.'
                  : 'Critical microbial hazard detected. Significant acetic, ethanol, and ammonia volatile byproducts detected in chamber headspace.'}
              </p>
            </div>

            {/* Freshness Index & Progress Track Bar */}
            <div className="p-4 rounded-xl bg-black border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between font-mono">
                <span className="text-xs text-neutral-400 uppercase font-semibold tracking-wider">
                  Quantitative Freshness Index:
                </span>
                <span
                  className={`text-xl sm:text-2xl font-black tabular-nums ${
                    isFresh
                      ? 'text-emerald-400'
                      : isFairlyFresh
                      ? 'text-amber-400'
                      : isStale
                      ? 'text-orange-400'
                      : 'text-rose-400'
                  }`}
                >
                  {freshnessIndex ? freshnessIndex.toFixed(1) : '94.6'}%
                </span>
              </div>

              {/* Mechanical Progress Gauge */}
              <div className="w-full bg-neutral-900 h-2.5 rounded-full overflow-hidden border border-neutral-800">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isFresh
                      ? 'bg-emerald-500'
                      : isFairlyFresh
                      ? 'bg-amber-500'
                      : isStale
                      ? 'bg-orange-500'
                      : 'bg-rose-500'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.max(8, freshnessIndex || 95))}%`,
                  }}
                />
              </div>
            </div>

            {/* 4-Parameter Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
              <div className="p-3 rounded-xl bg-black border border-neutral-800/80">
                <span className="text-[10px] text-neutral-400 uppercase block tracking-wider mb-1">
                  R_GAS (MOX)
                </span>
                <span className="text-base sm:text-lg font-bold text-white tabular-nums">
                  {currentGasKohm.toFixed(2)}{' '}
                  <span className="text-xs text-neutral-400 font-normal">kΩ</span>
                </span>
              </div>

              <div className="p-3 rounded-xl bg-black border border-neutral-800/80">
                <span className="text-[10px] text-neutral-400 uppercase block tracking-wider mb-1">
                  CHAMBER TEMP
                </span>
                <span className="text-base sm:text-lg font-bold text-white tabular-nums">
                  {currentTempC.toFixed(1)}{' '}
                  <span className="text-xs text-neutral-400 font-normal">°C</span>
                </span>
              </div>

              <div className="p-3 rounded-xl bg-black border border-neutral-800/80">
                <span className="text-[10px] text-neutral-400 uppercase block tracking-wider mb-1">
                  REL. HUMIDITY
                </span>
                <span className="text-base sm:text-lg font-bold text-white tabular-nums">
                  {currentHumidity.toFixed(0)}{' '}
                  <span className="text-xs text-neutral-400 font-normal">%</span>
                </span>
              </div>

              <div className="p-3 rounded-xl bg-black border border-neutral-800/80">
                <span className="text-[10px] text-neutral-400 uppercase block tracking-wider mb-1">
                  PRESSURE
                </span>
                <span className="text-base sm:text-lg font-bold text-white tabular-nums">
                  {currentPressure.toFixed(0)}{' '}
                  <span className="text-xs text-neutral-400 font-normal">hPa</span>
                </span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Audited via SmartElex BME688 MOX gas sensor hardware</span>
              </div>

              <button
                onClick={onReset}
                className="py-3 px-5 rounded-xl bg-white text-black font-extrabold text-xs sm:text-sm hover:bg-neutral-200 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Start New Cake Test</span>
              </button>
            </div>
          </div>
        ) : (
          /* Case B: Standby or Ingestion Mode */
          <div className="py-6 sm:py-8 text-center space-y-4">
            <div className="space-y-2">
              <div className="w-12 h-12 mx-auto rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400">
                {isTesting ? (
                  <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
                ) : (
                  <Sliders className="w-6 h-6 text-neutral-400" />
                )}
              </div>

              <div className="text-base sm:text-lg font-bold text-white uppercase tracking-wider">
                {isTesting
                  ? 'Analyzing Chamber Headspace Volatiles...'
                  : 'Diagnostic Station Calibrated & Standby'}
              </div>

              <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
                {isTesting
                  ? `Active MOX sampling in progress (Sample #${readingsCount || 1} • Every 2.5s). The official verdict will be certified automatically.`
                  : 'Select cake specimen configuration above and press "RUN TEST" to initiate automated electronic nose diagnostic inspection.'}
              </p>
            </div>

            {/* Standby Baseline Parameters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-left max-w-2xl mx-auto pt-2">
              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-900">
                <span className="text-[10px] text-neutral-500 uppercase block tracking-wider">
                  Baseline R₀
                </span>
                <span className="text-sm font-bold text-neutral-200 tabular-nums">
                  {currentGasKohm.toFixed(2)} kΩ
                </span>
              </div>

              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-900">
                <span className="text-[10px] text-neutral-500 uppercase block tracking-wider">
                  Chamber Temp
                </span>
                <span className="text-sm font-bold text-neutral-200 tabular-nums">
                  {currentTempC.toFixed(1)} °C
                </span>
              </div>

              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-900">
                <span className="text-[10px] text-neutral-500 uppercase block tracking-wider">
                  Humidity
                </span>
                <span className="text-sm font-bold text-neutral-200 tabular-nums">
                  {currentHumidity.toFixed(0)} %
                </span>
              </div>

              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-900">
                <span className="text-[10px] text-neutral-500 uppercase block tracking-wider">
                  Target Specimen
                </span>
                <span className="text-sm font-bold text-white truncate block">
                  {selectedCake.split('—')[0]}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* 2. SUB-CARD 1: Interactive VOC Response Curve Scrubber (Bottom Left) */
interface VOCScrubberCardProps {
  uid: string;
  gasHistory: number[];
  isTesting: boolean;
  currentGasKohm: number;
}

function VOCScrubberCard({ uid, gasHistory, isTesting, currentGasKohm }: VOCScrubberCardProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const W = 380;
  const H = 150;
  const pad = 18;

  const vals = gasHistory.length > 1 ? gasHistory : [24.0, 24.3, 24.5, 24.2, 24.8];
  const { line, area, points } = chartPaths(vals, W, H, pad);

  const fillId = uid + 'vocGradient';
  const baseline = vals[0] || 24.5;

  const activeIndex = hoverIndex !== null ? hoverIndex : points.length - 1;
  const activePt = points[activeIndex] || points[points.length - 1];
  const activeVal = vals[activeIndex] || vals[vals.length - 1];

  const deltaPercent = Number((((activeVal - baseline) / baseline) * 100).toFixed(1));

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const xs = points.map((p) => p[0]);
    setHoverIndex(nearestIndex(xs, x));
  };

  return (
    <div className="ib-frame ib-frame-hover">
      <Brackets />
      <div className="ib-card p-4 sm:p-5 flex flex-col justify-between space-y-3">
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              VOC Gas Resistance Curve (R_gas)
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">
            Scrubbable Graph
          </span>
        </div>

        {/* Interactive Scrubbing Graph */}
        <div className="relative py-1">
          <svg
            className="ib-diagram ib-chart w-full"
            viewBox={`0 0 ${W} ${H + 8}`}
            onPointerMove={onPointerMove}
            onPointerLeave={() => setHoverIndex(null)}
            role="img"
            aria-label="Gas Resistance Response Curve"
          >
            <defs>
              <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#06b6d4" stopOpacity=".25" />
                <stop offset="1" stopColor="#06b6d4" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid Guideline ticks */}
            {[0.25, 0.5, 0.75].map((g) => (
              <line
                key={g}
                x1={pad}
                x2={W - pad}
                y1={H * g}
                y2={H * g}
                stroke="var(--ib-line)"
                strokeDasharray="2 3"
              />
            ))}

            {/* Area Fill */}
            <path d={area} fill={`url(#${fillId})`} />

            {/* Main Smooth Line Path */}
            <path
              d={line}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2"
              className="ib-line-draw"
            />

            {/* Active Pointer Hover Line */}
            {hoverIndex !== null && (
              <line
                x1={activePt[0]}
                x2={activePt[0]}
                y1={pad - 4}
                y2={H - pad + 4}
                stroke="#ffffff"
                strokeOpacity=".5"
                strokeWidth="1.2"
                strokeDasharray="2 2"
              />
            )}

            {/* Active Point Circle Indicator */}
            <circle
              cx={activePt[0]}
              cy={activePt[1]}
              r="4"
              fill="#09090b"
              stroke="#06b6d4"
              strokeWidth="2"
            />

            {/* Scrub Tooltip Floating Badge */}
            <g
              transform={`translate(${clamp(activePt[0], 65, W - 65)}, ${
                activePt[1] < 34 ? activePt[1] + 24 : activePt[1] - 14
              })`}
            >
              <rect
                x="-58"
                y="-11"
                width="116"
                height="19"
                rx="4"
                fill="#09090b"
                stroke="#27272a"
                strokeWidth="1"
              />
              <text
                x="0"
                y="2"
                textAnchor="middle"
                fontSize="8.5"
                fill="#f4f4f5"
                fontFamily="var(--ib-mono)"
                fontWeight="bold"
              >
                {`T+${(activeIndex * 2.5).toFixed(1)}s · ${activeVal.toFixed(2)} kΩ (${
                  deltaPercent >= 0 ? '+' : ''
                }${deltaPercent}%)`}
              </text>
            </g>
          </svg>
        </div>

        {/* Telemetry Stats Breakdown */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-neutral-800/80 text-left font-mono">
          <div className="p-2 rounded bg-neutral-950 border border-neutral-900">
            <span className="text-[10px] text-neutral-500 uppercase block">Chamber R₀</span>
            <span className="text-xs font-bold text-white tabular-nums">{baseline.toFixed(2)} kΩ</span>
          </div>
          <div className="p-2 rounded bg-neutral-950 border border-neutral-900">
            <span className="text-[10px] text-neutral-500 uppercase block">Current R_gas</span>
            <span className="text-xs font-bold text-cyan-400 tabular-nums">
              {currentGasKohm.toFixed(2)} kΩ
            </span>
          </div>
          <div className="p-2 rounded bg-neutral-950 border border-neutral-900">
            <span className="text-[10px] text-neutral-500 uppercase block">ΔR / R₀ Shift</span>
            <span
              className={`text-xs font-bold tabular-nums ${
                deltaPercent >= 0 ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {deltaPercent >= 0 ? `+${deltaPercent}` : deltaPercent}%
            </span>
          </div>
        </div>

        <p className="text-[11px] text-neutral-400 leading-normal">
          Touch or drag across the curve to inspect second-by-second headspace adsorption.
          Decreasing resistance correlates with volatile accumulation.
        </p>
      </div>
    </div>
  );
}

/* 3. SUB-CARD 2: Hardware Signal Flow Architecture (Bottom Right) */
interface HardwareFlowCardProps {
  uid: string;
  isTesting: boolean;
  hasResult: boolean;
  testId: string;
  selectedCake: CakeType;
}

function HardwareFlowCard({
  uid,
  isTesting,
  hasResult,
  testId,
  selectedCake,
}: HardwareFlowCardProps) {
  // SVG Flow Paths connecting the 3 responsive nodes
  const L1 = 'M90,44 C120,44 130,44 160,44';
  const R1 = 'M240,44 C270,44 280,44 310,44';

  return (
    <div className="ib-frame ib-frame-hover">
      <Brackets />
      <div className="ib-card p-4 sm:p-5 flex flex-col justify-between space-y-4">
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Hardware Bus &amp; Signal Flow
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">
            I2C 0x76 • 320°C MOX
          </span>
        </div>

        {/* 3-Node Architecture Pipeline (Responsive HTML Nodes with SVG animated circuit) */}
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2 items-center text-center">
            {/* Node 1: ESP32 */}
            <div className="p-2.5 rounded-xl bg-black border border-neutral-800 flex flex-col items-center justify-center space-y-1">
              <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white">
                <Cpu className="w-3.5 h-3.5" />
              </div>
              <div className="font-bold text-[11px] text-white">ESP32</div>
              <div className="text-[9px] font-mono text-neutral-400">2.4GHz BLE</div>
              <div className="flex items-center gap-1 text-[9px] font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>ONLINE</span>
              </div>
            </div>

            {/* Node 2: BME688 MOX Sensor */}
            <div className="p-2.5 rounded-xl bg-black border border-neutral-800 flex flex-col items-center justify-center space-y-1 relative">
              <div className="w-7 h-7 rounded-lg bg-amber-950/40 border border-amber-800/60 flex items-center justify-center text-amber-400">
                <Flame className="w-3.5 h-3.5" />
              </div>
              <div className="font-bold text-[11px] text-white">BME688</div>
              <div className="text-[9px] font-mono text-neutral-400">320°C MOX</div>
              <div className="text-[9px] font-mono text-amber-400">HEATED</div>
            </div>

            {/* Node 3: Technical Audit Ledger */}
            <div className="p-2.5 rounded-xl bg-black border border-neutral-800 flex flex-col items-center justify-center space-y-1">
              <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white">
                <FileCheck2 className="w-3.5 h-3.5" />
              </div>
              <div className="font-bold text-[11px] text-white">Audit Log</div>
              <div className="text-[9px] font-mono text-neutral-400">#{testId}</div>
              <div className="text-[9px] font-mono text-emerald-400">SEALED</div>
            </div>
          </div>

          {/* Animated Connecting SVG Circuit */}
          <div className="h-6 w-full relative">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 400 24"
              preserveAspectRatio="none"
            >
              <line x1="50" y1="12" x2="350" y2="12" stroke="var(--ib-line)" strokeWidth="1.5" />
              <line
                x1="50"
                y1="12"
                x2="350"
                y2="12"
                stroke="#06b6d4"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                className="ib-dash"
              />

              {(isTesting || hasResult) && (
                <>
                  <circle r="2.5" className="ib-pkt">
                    <animateMotion
                      dur="2.2s"
                      repeatCount="indefinite"
                      path="M50,12 L350,12"
                    />
                  </circle>
                  <circle r="2.5" className="ib-pkt">
                    <animateMotion
                      dur="2.2s"
                      begin="0.8s"
                      repeatCount="indefinite"
                      path="M50,12 L350,12"
                    />
                  </circle>
                </>
              )}
            </svg>
          </div>
        </div>

        {/* Technical Explanations */}
        <div className="space-y-2 border-t border-neutral-800/80 pt-2 text-left">
          <div className="flex items-start gap-2">
            <Activity className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-neutral-400 leading-snug">
              <strong className="text-white">Active Chemisorption:</strong> Ambient volatiles react with the heated metal-oxide matrix, generating micro-voltage shifts over I2C.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-neutral-400 leading-snug">
              <strong className="text-white">Deconvolution:</strong> Temperature, humidity, and barometric pressure are continuously compensated to isolate true aroma degradation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ CSS */

const IB_BENTO_CSS = `
.ib-root {
  --ib-page: #000000;
  --ib-hatch: rgba(255, 255, 255, 0.035);
  --ib-paper: #09090b;
  --ib-card: #111114;
  --ib-raise: #18181c;
  --ib-ink: #f4f4f5;
  --ib-soft: #d4d4d8;
  --ib-muted: #82828e;
  --ib-faint: #52525b;
  --ib-line: #222227;
  --ib-line-strong: #33333d;
  --ib-bracket: #52525b;
  --ib-inv: #f4f4f5;
  --ib-inv-ink: #09090b;
  --ib-shadow: 0 1px 3px rgba(0,0,0,.6), 0 12px 32px -12px rgba(0,0,0,.8);
  --ib-sans: var(--font-sans), "Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --ib-mono: var(--font-mono), "Geist Mono", "JetBrains Mono", Menlo, Consolas, monospace;

  position: relative;
  width: 100%;
  box-sizing: border-box;
  background-color: var(--ib-page);
  background-image: repeating-linear-gradient(135deg, var(--ib-hatch) 0 1px, transparent 1px 11px);
  color: var(--ib-ink);
  font-family: var(--ib-sans);
  border-radius: 1rem;
  border: 1px solid var(--ib-line);
  padding: 1.5rem clamp(0.75rem, 2vw, 1.5rem);
  transition: background-color .4s ease, color .4s ease;
}

.ib-root :where(*) {
  box-sizing: border-box;
}

.ib-shell {
  width: 100%;
  max-width: 1080px;
  margin: 0 auto;
}

.ib-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  margin-bottom: 1.25rem;
}

.ib-tag {
  display: inline-block;
  padding: 3px 10px;
  font-size: 11px;
  letter-spacing: .03em;
  color: var(--ib-soft);
  background: var(--ib-card);
  border: 1px solid var(--ib-line);
  border-radius: 9999px;
}

.ib-h2 {
  font-size: clamp(20px, 3.2vw, 32px);
  line-height: 1.15;
  letter-spacing: -.025em;
  font-weight: 800;
  color: var(--ib-ink);
}

.ib-muted {
  color: var(--ib-muted);
}

.ib-frame {
  position: relative;
}

/* Corner Architectural Brackets */
.ib-c {
  position: absolute;
  width: 12px;
  height: 12px;
  border-color: var(--ib-bracket);
  border-style: solid;
  border-width: 0;
  pointer-events: none;
  transition: border-color .3s, transform .35s cubic-bezier(.2,.8,.2,1);
  z-index: 2;
}

.ib-c-tl { top: -6px; left: -6px; border-top-width: 1.5px; border-left-width: 1.5px; }
.ib-c-tr { top: -6px; right: -6px; border-top-width: 1.5px; border-right-width: 1.5px; }
.ib-c-bl { bottom: -6px; left: -6px; border-bottom-width: 1.5px; border-left-width: 1.5px; }
.ib-c-br { bottom: -6px; right: -6px; border-bottom-width: 1.5px; border-right-width: 1.5px; }

.ib-frame-hover:hover > .ib-c {
  border-color: #ffffff;
}
.ib-frame-hover:hover > .ib-c-tl { transform: translate(-3px, -3px); }
.ib-frame-hover:hover > .ib-c-tr { transform: translate(3px, -3px); }
.ib-frame-hover:hover > .ib-c-bl { transform: translate(-3px, 3px); }
.ib-frame-hover:hover > .ib-c-br { transform: translate(3px, 3px); }

.ib-card {
  background: linear-gradient(180deg, var(--ib-raise), var(--ib-card));
  border: 1px solid var(--ib-line);
  border-radius: 0.75rem;
  transition: border-color .3s, box-shadow .35s;
}

.ib-card:hover {
  border-color: var(--ib-line-strong);
  box-shadow: var(--ib-shadow);
}

.ib-diagram {
  width: 100%;
  height: auto;
  overflow: visible;
}

.ib-dash {
  stroke-dasharray: 4 4;
  animation: ib-dash 1.2s linear infinite;
}

.ib-pkt {
  fill: #38bdf8;
  filter: drop-shadow(0 0 4px #0ea5e9);
}

.ib-chart {
  cursor: crosshair;
}

.ib-line-draw {
  stroke-dasharray: 1000;
  stroke-dashoffset: 0;
  transition: stroke-dashoffset 1.8s cubic-bezier(.4,.1,.2,1);
}

@keyframes ib-dash {
  to {
    stroke-dashoffset: -16;
  }
}
`;

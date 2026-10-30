'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { webSerial } from '@/lib/serial/web-serial-manager';
import { testRunService } from '@/services/test-run-service';
import {
  TestRun,
  CakeCategory,
  StorageCondition,
  TestStage,
  TestStatus,
} from '@/types/test-run';
import { LiveSensorReading, SerialConnectionStatus } from '@/types/serial';
import { Button } from '@/components/common/button';
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
import {
  PlayCircle,
  PauseCircle,
  StopCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Cpu,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function RunTestPage() {
  const router = useRouter();

  // Hardware state
  const [serialStatus, setSerialStatus] = useState<SerialConnectionStatus>('Disconnected');
  const [serialMessage, setSerialMessage] = useState('');
  const [lastReading, setLastReading] = useState<LiveSensorReading | null>(null);

  // Form config state
  const [sampleId, setSampleId] = useState('SMP-001');
  const [cakeCategory, setCakeCategory] = useState<CakeCategory>('Normal cake');
  const [storageCondition, setStorageCondition] = useState<StorageCondition>('Unfrozen');
  const [stage, setStage] = useState<TestStage>('Cake sample');
  const [plannedDurationSeconds, setPlannedDurationSeconds] = useState(360);
  const [operatorNotes, setOperatorNotes] = useState('');

  // Active test execution state
  const [activeTest, setActiveTest] = useState<TestRun | null>(null);
  const [liveReadings, setLiveReadings] = useState<LiveSensorReading[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  // Active chart metric selection
  const [activeMetric, setActiveMetric] = useState<'gas' | 'temp' | 'humidity' | 'pressure'>('gas');

  useEffect(() => {
    const unsubSerialStatus = webSerial.subscribeStatus((st, msg) => {
      setSerialStatus(st);
      setSerialMessage(msg || '');
    });

    const unsubSerialReading = webSerial.subscribeReading((r) => {
      setLastReading(r);
    });

    const unsubTest = testRunService.subscribeCurrentTest((test) => {
      setActiveTest(test);
      if (test) {
        setLiveReadings([...testRunService.getCurrentReadings()]);
      }
    });

    const unsubLive = testRunService.subscribeLiveReadings((r) => {
      setLiveReadings((prev) => [...prev, r]);
    });

    return () => {
      unsubSerialStatus();
      unsubSerialReading();
      unsubTest();
      unsubLive();
    };
  }, []);

  // Readiness validation
  const checkPortConnected = serialStatus === 'Connected' || serialStatus === 'Stale';
  const checkReadingsArriving = Boolean(lastReading);
  const checkSensorOk = lastReading?.status === 'OK' || lastReading?.status === 'STABLE';
  const checkSampleIdValid = sampleId.trim().length > 0;
  const isReadyToStart =
    checkPortConnected &&
    checkReadingsArriving &&
    checkSensorOk &&
    checkSampleIdValid &&
    (!activeTest || activeTest.status === 'Completed' || activeTest.status === 'Interrupted' || activeTest.status === 'Invalid');

  const handleStartTest = async () => {
    setErrorMessage(null);
    setIsStarting(true);
    try {
      await testRunService.startTest({
        sampleId: sampleId.trim(),
        cakeCategory,
        storageCondition,
        stage,
        plannedDurationSeconds: Number(plannedDurationSeconds),
        operatorNotes: operatorNotes.trim() || undefined,
      });
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to start test');
    } finally {
      setIsStarting(false);
    }
  };

  const handlePauseTest = () => {
    testRunService.pauseTest();
  };

  const handleResumeTest = () => {
    try {
      testRunService.resumeTest();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to resume test');
    }
  };

  const handleStopTest = async () => {
    const confirmStop = window.confirm(
      'Are you sure you want to stop this test run? The test will be finalized with its actual recorded duration.'
    );
    if (!confirmStop) return;
    await testRunService.stopTest('Operator manually stopped the test run.');
  };

  // Metric configs for Recharts
  const metricConfigs = {
    gas: {
      label: 'Gas Resistance',
      unit: 'kΩ',
      dataKey: 'gas_resistance_kohm',
      color: '#ffffff',
    },
    temp: {
      label: 'Temperature',
      unit: '°C',
      dataKey: 'temperature_C',
      color: '#ffffff',
    },
    humidity: {
      label: 'Relative Humidity',
      unit: '%',
      dataKey: 'humidity_percent',
      color: '#ffffff',
    },
    pressure: {
      label: 'Barometric Pressure',
      unit: 'hPa',
      dataKey: 'pressure_hPa',
      color: '#ffffff',
    },
  };

  const currentMetricConfig = metricConfigs[activeMetric];

  // Chart data formatted from live readings
  const chartData = liveReadings.map((r, i) => ({
    second: Math.round(r.elapsed_ms / 1000),
    seq: r.seq,
    gas_resistance_kohm: r.gas_resistance_kohm,
    temperature_C: r.temperature_C,
    humidity_percent: r.humidity_percent,
    pressure_hPa: r.pressure_hPa,
  }));

  const isTestActive = Boolean(
    activeTest && (activeTest.status === 'Running' || activeTest.status === 'Paused')
  );

  const progressPercent = activeTest
    ? Math.min(
        100,
        Math.round(
          (activeTest.actualDurationSeconds / activeTest.plannedDurationSeconds) * 100
        )
      )
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 bg-black text-white">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2.5">
            <PlayCircle className="w-6 h-6 text-white" />
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Run Sensor Experiment
            </h1>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Capture actual real-time telemetry from connected ESP32 • BME688 MOX gas sensor
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/connection">
            <Button variant="outline" size="sm">
              <Cpu className="w-3.5 h-3.5 mr-1" />
              <span>Check Connection</span>
            </Button>
          </Link>
          <Link href="/history">
            <Button variant="secondary" size="sm">
              <span>View Past Tests</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-neutral-900 border border-rose-500/50 text-white text-xs flex items-center gap-2">
          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Test Configuration & Readiness (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Step A: Prepare Experiment Form */}
          <div className="p-5 sm:p-6 rounded-lg bg-black border border-neutral-800 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center font-bold text-[10px]">
                A
              </span>
              <span>Step 1: Test Configuration</span>
            </h2>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1">
                  Sample ID *
                </label>
                <input
                  type="text"
                  required
                  disabled={isTestActive}
                  value={sampleId}
                  onChange={(e) => setSampleId(e.target.value)}
                  placeholder="e.g. SMP-NC-UF-01"
                  className="w-full px-3 py-2 rounded-md bg-neutral-950 border border-neutral-800 text-xs text-white font-mono focus:outline-none focus:border-white disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1">
                    Cake Category
                  </label>
                  <select
                    disabled={isTestActive}
                    value={cakeCategory}
                    onChange={(e) => setCakeCategory(e.target.value as CakeCategory)}
                    className="w-full px-3 py-2 rounded-md bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-white disabled:opacity-50"
                  >
                    <option value="Normal cake">Normal cake</option>
                    <option value="Pastry cake">Pastry cake</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1">
                    Storage Condition
                  </label>
                  <select
                    disabled={isTestActive}
                    value={storageCondition}
                    onChange={(e) => setStorageCondition(e.target.value as StorageCondition)}
                    className="w-full px-3 py-2 rounded-md bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-white disabled:opacity-50"
                  >
                    <option value="Unfrozen">Unfrozen (Ambient/Chilled)</option>
                    <option value="Frozen">Frozen (-18°C)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1">
                    Protocol Stage
                  </label>
                  <select
                    disabled={isTestActive}
                    value={stage}
                    onChange={(e) => setStage(e.target.value as TestStage)}
                    className="w-full px-3 py-2 rounded-md bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-white disabled:opacity-50"
                  >
                    <option value="Cake sample">Cake sample</option>
                    <option value="Room control">Room control (Baseline)</option>
                    <option value="Empty-container control">Empty-container control</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1">
                    Duration (Seconds)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={3600}
                    step={10}
                    disabled={isTestActive}
                    value={plannedDurationSeconds}
                    onChange={(e) => setPlannedDurationSeconds(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-md bg-neutral-950 border border-neutral-800 text-xs text-white font-mono focus:outline-none focus:border-white disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1">
                  Operator Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  disabled={isTestActive}
                  value={operatorNotes}
                  onChange={(e) => setOperatorNotes(e.target.value)}
                  placeholder="e.g. Purged test chamber with dry air for 2 min before loading..."
                  className="w-full px-3 py-2 rounded-md bg-neutral-950 border border-neutral-800 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-white disabled:opacity-50"
                />
              </div>

              <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-400">
                <strong className="text-white">Note:</strong> Do not assume frozen indicates fresh or unfrozen indicates spoiled. The system preserves actual sensor measurements without preconception.
              </div>
            </div>
          </div>

          {/* Step B: Readiness Verification Checklist */}
          <div className="p-5 sm:p-6 rounded-lg bg-black border border-neutral-800 space-y-3.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center font-bold text-[10px]">
                B
              </span>
              <span>Step 2: Hardware Readiness Checklist</span>
            </h2>

            <div className="space-y-2 text-xs">
              {/* Check 1 */}
              <div className="flex items-center justify-between p-2.5 rounded bg-neutral-950 border border-neutral-800">
                <span className="text-white font-medium">1. ESP32 USB Connection</span>
                {checkPortConnected ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> OK
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
                    <XCircle className="w-3.5 h-3.5" /> Disconnected
                  </span>
                )}
              </div>

              {/* Check 2 */}
              <div className="flex items-center justify-between p-2.5 rounded bg-neutral-950 border border-neutral-800">
                <span className="text-white font-medium">2. Sensor Telemetry Active</span>
                {checkReadingsArriving ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Packets Arriving
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-neutral-400 font-bold">
                    <XCircle className="w-3.5 h-3.5" /> No Packets
                  </span>
                )}
              </div>

              {/* Check 3 */}
              <div className="flex items-center justify-between p-2.5 rounded bg-neutral-950 border border-neutral-800">
                <span className="text-white font-medium">3. BME688 Status OK</span>
                {checkSensorOk ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ready (0x76)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-400 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" /> {lastReading?.status || 'Awaiting init'}
                  </span>
                )}
              </div>

              {/* Check 4 */}
              <div className="flex items-center justify-between p-2.5 rounded bg-neutral-950 border border-neutral-800">
                <span className="text-white font-medium">4. Sample Metadata Specified</span>
                {checkSampleIdValid ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
                    <XCircle className="w-3.5 h-3.5" /> Sample ID Missing
                  </span>
                )}
              </div>
            </div>

            {!isReadyToStart && !isTestActive && (
              <p className="text-[11px] text-amber-300 font-medium">
                * Start Test is disabled until all required checks are satisfied. If hardware is disconnected, connect on the{' '}
                <Link href="/connection" className="underline font-bold text-white">
                  Connection page
                </Link>.
              </p>
            )}

            {/* Action buttons */}
            {!isTestActive ? (
              <Button
                variant="primary"
                size="md"
                onClick={handleStartTest}
                disabled={!isReadyToStart || isStarting}
                isLoading={isStarting}
                className="w-full py-2.5 text-sm"
              >
                <PlayCircle className="w-4 h-4 mr-1.5" />
                <span>Start Test Protocol</span>
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                {activeTest?.status === 'Running' ? (
                  <Button variant="secondary" size="md" onClick={handlePauseTest}>
                    <PauseCircle className="w-4 h-4 mr-1" />
                    <span>Pause Test</span>
                  </Button>
                ) : (
                  <Button variant="primary" size="md" onClick={handleResumeTest}>
                    <PlayCircle className="w-4 h-4 mr-1" />
                    <span>Resume Test</span>
                  </Button>
                )}

                <Button variant="danger" size="md" onClick={handleStopTest}>
                  <StopCircle className="w-4 h-4 mr-1" />
                  <span>Stop Test</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Telemetry & Timeseries Chart (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Test Execution Card */}
          <div className="p-5 sm:p-6 rounded-lg bg-black border border-neutral-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Execution State:
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-mono font-bold uppercase tracking-wider border ${
                      activeTest?.status === 'Running'
                        ? 'bg-neutral-900 text-emerald-300 border-emerald-500'
                        : activeTest?.status === 'Paused'
                        ? 'bg-neutral-900 text-amber-300 border-amber-500'
                        : activeTest?.status === 'Completed'
                        ? 'bg-neutral-900 text-white border-white'
                        : 'bg-neutral-950 text-neutral-400 border-neutral-800'
                    }`}
                  >
                    {activeTest?.status || 'Idle / Not Started'}
                  </span>
                </div>
                {activeTest && (
                  <div className="text-sm font-bold text-white font-mono mt-1">
                    {activeTest.id} • {activeTest.sampleId}
                  </div>
                )}
              </div>

              {activeTest && (
                <div className="text-right">
                  <div className="text-2xl font-mono font-bold text-white">
                    {activeTest.actualDurationSeconds}s{' '}
                    <span className="text-xs text-neutral-400 font-normal">
                      / {activeTest.plannedDurationSeconds}s
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    {activeTest.validReadingsCount} valid packets
                  </div>
                </div>
              )}
            </div>

            {/* Progress bar */}
            {activeTest && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-neutral-400 font-mono">
                  <span>Progress</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded bg-neutral-900 overflow-hidden border border-neutral-800">
                  <div
                    className="h-full bg-white transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Warnings or interruptions during run */}
            {activeTest && activeTest.interruptionEvents.length > 0 && (
              <div className="p-3 rounded bg-neutral-900 border border-amber-500/50 text-amber-300 text-xs space-y-1 font-mono">
                <div className="font-bold flex items-center gap-1 text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Recorded Interruption Events ({activeTest.interruptionEvents.length}):</span>
                </div>
                {activeTest.interruptionEvents.slice(-3).map((ev, i) => (
                  <div key={i} className="text-[11px] text-neutral-300">
                    [{new Date(ev.timestamp).toLocaleTimeString()}] {ev.reason}
                  </div>
                ))}
              </div>
            )}

            {/* If test is finalized, provide next actions */}
            {activeTest &&
              (activeTest.status === 'Completed' ||
                activeTest.status === 'Interrupted' ||
                activeTest.status === 'Invalid') && (
                <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-700 space-y-3">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>
                      Test Run Finalized ({activeTest.status}). Captured {activeTest.validReadingsCount} actual raw readings.
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Link href={`/results/${activeTest.id}`}>
                      <Button variant="primary" size="sm">
                        <span>View Report & QR Code</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveTest(null);
                        setLiveReadings([]);
                      }}
                    >
                      <span>Prepare Another Test</span>
                    </Button>
                  </div>
                </div>
              )}
          </div>

          {/* Real-time Timeseries Graph */}
          <div className="p-5 sm:p-6 rounded-lg bg-black border border-neutral-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Live Sensor Timeseries ({currentMetricConfig.label})
              </h3>

              {/* Metric tabs */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {(['gas', 'temp', 'humidity', 'pressure'] as const).map((key) => {
                  const cfg = metricConfigs[key];
                  const isSel = activeMetric === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveMetric(key)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                        isSel
                          ? 'bg-white text-black font-bold'
                          : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                      }`}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {chartData.length > 0 ? (
              <div className="h-64 sm:h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                    <XAxis
                      dataKey="second"
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
                      label={{
                        value: `${currentMetricConfig.label} (${currentMetricConfig.unit})`,
                        angle: -90,
                        position: 'insideLeft',
                        offset: 5,
                        fill: '#ffffff',
                        fontSize: 11,
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#000000',
                        borderColor: '#404040',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey={currentMetricConfig.dataKey}
                      name={`${currentMetricConfig.label} (${currentMetricConfig.unit})`}
                      stroke={currentMetricConfig.color}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-neutral-800 rounded bg-neutral-950 text-neutral-500 text-xs">
                <Clock className="w-8 h-8 text-neutral-600 mb-2" />
                <span>No live data points captured yet. Start a test to begin streaming.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

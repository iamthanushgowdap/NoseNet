'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  ArrowLeft,
  Download,
  Calendar,
  Clock,
  Flame,
  Thermometer,
  Droplets,
  Gauge,
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  ExternalLink,
  RefreshCw,
  Copy,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { TestRun, TestReport } from '@/types/test-run';
import { LiveSensorReading } from '@/types/serial';
import { IndependentHumanAssessment } from '@/types/assessment';
import { idbStorage } from '@/lib/storage/indexed-db';
import { ReportService } from '@/services/report-service';
import { ExportService } from '@/services/export-service';
import { formatDate } from '@/lib/utils';

function SingleTestResultContent() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;

  const [testRun, setTestRun] = useState<TestRun | null>(null);
  const [readings, setReadings] = useState<LiveSensorReading[]>([]);
  const [report, setReport] = useState<TestReport | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [assessmentUrl, setAssessmentUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showMovingAverage, setShowMovingAverage] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isRefreshingAssessment, setIsRefreshingAssessment] = useState(false);

  useEffect(() => {
    async function loadTest() {
      if (!testId) return;
      setIsLoading(true);
      try {
        const test = await idbStorage.getTestRun(testId);
        if (!test) {
          setIsLoading(false);
          return;
        }
        setTestRun(test);

        const data = await idbStorage.getReadingsForTest(testId);
        setReadings(data);

        // Fetch or attach human assessment
        let assessment = test.humanAssessment || null;
        if (test.assessmentToken) {
          const origin = typeof window !== 'undefined' ? window.location.origin : '';
          const url = `${origin}/assess/${test.assessmentToken}`;
          setAssessmentUrl(url);

          try {
            const qr = await QRCode.toDataURL(url, {
              width: 220,
              margin: 1,
              color: { dark: '#000000', light: '#ffffff' },
            });
            setQrCodeDataUrl(qr);
          } catch (err) {
            console.error('QR generation failed:', err);
          }

          // Check if server has an updated assessment
          try {
            const res = await fetch(`/api/assessments/${test.assessmentToken}/status`);
            if (res.ok) {
              const statusData = await res.json();
              if (statusData.submitted && statusData.assessment) {
                assessment = statusData.assessment;
                if (!test.humanAssessment) {
                  const updatedTest: TestRun = {
                    ...test,
                    humanAssessment: assessment,
                    assessmentStatus: 'Submitted',
                  };
                  await idbStorage.saveTestRun(updatedTest);
                  setTestRun(updatedTest);
                }
              }
            }
          } catch (fetchErr) {
            console.warn('Could not sync assessment status:', fetchErr);
          }
        }

        const rep = ReportService.calculateReport(test, data, assessment);
        setReport(rep);
      } catch (e) {
        console.error('Failed to load test report:', e);
      } finally {
        setIsLoading(false);
      }
    }

    loadTest();
  }, [testId]);

  const refreshAssessmentStatus = async () => {
    if (!testRun?.assessmentToken) return;
    setIsRefreshingAssessment(true);
    try {
      const res = await fetch(`/api/assessments/${testRun.assessmentToken}/status`);
      if (res.ok) {
        const statusData = await res.json();
        if (statusData.submitted && statusData.assessment) {
          const updatedTest: TestRun = {
            ...testRun,
            humanAssessment: statusData.assessment,
            assessmentStatus: 'Submitted',
          };
          await idbStorage.saveTestRun(updatedTest);
          setTestRun(updatedTest);
          const rep = ReportService.calculateReport(updatedTest, readings, statusData.assessment);
          setReport(rep);
        }
      }
    } catch (e) {
      console.error('Error refreshing assessment:', e);
    } finally {
      setIsRefreshingAssessment(false);
    }
  };

  const chartData = useMemo(() => {
    return readings.map((r, index) => {
      // Calculate 5-point moving average for gas resistance
      let maGas: number | null = null;
      if (index >= 4) {
        const slice = readings.slice(index - 4, index + 1);
        const sum = slice.reduce((acc, curr) => acc + curr.gas_resistance_kohm, 0);
        maGas = Number((sum / 5).toFixed(2));
      }

      return {
        seq: r.seq,
        timeSec: Math.round(r.elapsed_ms / 1000),
        gas_kohm: r.gas_resistance_kohm,
        gas_ma: maGas,
        temperature: r.temperature_C,
        humidity: r.humidity_percent,
        pressure: r.pressure_hPa,
        status: r.status,
      };
    });
  }, [readings]);

  const handleCopyLink = () => {
    if (assessmentUrl) {
      navigator.clipboard.writeText(assessmentUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleExportRawCsv = () => {
    if (!testRun || readings.length === 0) return;
    const csv = ExportService.exportRawReadingsCsv(testRun, readings);
    ExportService.triggerDownload(csv, `nosenet_raw_${testRun.id}_${testRun.sampleId}.csv`, 'text/csv;charset=utf-8;');
  };

  const handleExportSummaryCsv = () => {
    if (!testRun) return;
    const csv = ExportService.exportTestRunsSummaryCsv([testRun]);
    ExportService.triggerDownload(csv, `nosenet_summary_${testRun.id}.csv`, 'text/csv;charset=utf-8;');
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-neutral-400">
        <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-3 text-white" />
        <p className="text-sm">Compiling test results and sensor metrics...</p>
      </div>
    );
  }

  if (!testRun || !report) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <AlertTriangle className="w-10 h-10 mx-auto text-amber-500 mb-3" />
        <h2 className="text-lg font-bold text-white">Test Run Not Found</h2>
        <p className="text-xs text-neutral-400 mt-1">
          The requested test ID "{testId}" could not be located in local IndexedDB.
        </p>
        <Link
          href="/history"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Test History</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full bg-black text-white space-y-8">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <Link
            href="/history"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Test History</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
              Test Report: {testRun.id}
            </h1>
            <span
              className={`text-xs px-2.5 py-0.5 rounded font-mono uppercase ${
                testRun.status === 'Completed' || testRun.status === 'completed'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}
            >
              {testRun.status}
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Sample ID: <span className="font-semibold text-white">{testRun.sampleId}</span> • Category:{' '}
            <span className="text-white">{testRun.cakeCategory}</span> • Condition:{' '}
            <span className="capitalize text-white">{testRun.storageCondition}</span> • Stage:{' '}
            <span className="font-mono text-white">{testRun.stage}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportRawCsv}
            disabled={readings.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-xs font-semibold text-white hover:bg-neutral-800 transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Raw Readings CSV</span>
          </button>
          <button
            onClick={handleExportSummaryCsv}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition"
          >
            <Download className="w-3.5 h-3.5 text-black" />
            <span>Export Summary</span>
          </button>
          <Link
            href={`/results?compare=${testRun.id}`}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-xs font-semibold text-neutral-300 hover:text-white transition"
          >
            <span>Compare Test</span>
          </Link>
        </div>
      </div>

      {/* Mandatory Honest Scientific Notice */}
      <div className="p-4 rounded-xl border border-neutral-700 bg-neutral-950 flex items-start gap-3.5">
        <ShieldAlert className="w-5 h-5 text-neutral-300 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            Sensor observations — freshness classification not yet validated
          </h4>
          <p className="text-xs text-neutral-400 leading-relaxed">
            {report.interpretationNotice} The recorded gas resistance, temperature, and humidity shifts reflect physical and volatile compound changes detected by the BME688 MOX gas sensor. Freshness classification requires rigorous microbiological plate counts and sensory validation benchmarks.
          </p>
        </div>
      </div>

      {/* Primary Metrics 4-Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gas Resistance Card */}
        <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-950 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-white" />
                Gas Resistance (R_gas)
              </span>
            </div>
            <div className="text-3xl font-extrabold font-mono text-white mt-1">
              {report.gasResistance.mean.toFixed(2)}
              <span className="text-sm font-normal text-neutral-400 ml-1">kΩ mean</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-900 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-neutral-400">
              <span>Start:</span>
              <span className="text-white">{report.gasResistance.start.toFixed(2)} kΩ</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>End:</span>
              <span className="text-white">{report.gasResistance.end.toFixed(2)} kΩ</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Δ Shift:</span>
              <span className={report.gasResistance.delta >= 0 ? 'text-emerald-400' : 'text-amber-400'}>
                {report.gasResistance.delta > 0 ? '+' : ''}
                {report.gasResistance.delta.toFixed(2)} kΩ ({report.gasResistance.percentChange}%)
              </span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Min / Max:</span>
              <span className="text-neutral-300">
                {report.gasResistance.min.toFixed(1)} / {report.gasResistance.max.toFixed(1)} kΩ
              </span>
            </div>
          </div>
        </div>

        {/* Temperature Card */}
        <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-950 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-white" />
                Temperature
              </span>
            </div>
            <div className="text-3xl font-extrabold font-mono text-white mt-1">
              {report.temperature.mean.toFixed(1)}
              <span className="text-sm font-normal text-neutral-400 ml-1">°C mean</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-900 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-neutral-400">
              <span>Start / End:</span>
              <span className="text-white">
                {report.temperature.start.toFixed(1)} → {report.temperature.end.toFixed(1)} °C
              </span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Δ Shift:</span>
              <span className="text-neutral-300">
                {report.temperature.delta > 0 ? '+' : ''}
                {report.temperature.delta.toFixed(2)} °C
              </span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Min / Max:</span>
              <span className="text-neutral-300">
                {report.temperature.min.toFixed(1)} / {report.temperature.max.toFixed(1)} °C
              </span>
            </div>
          </div>
        </div>

        {/* Humidity Card */}
        <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-950 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-white" />
                Relative Humidity
              </span>
            </div>
            <div className="text-3xl font-extrabold font-mono text-white mt-1">
              {report.humidity.mean.toFixed(1)}
              <span className="text-sm font-normal text-neutral-400 ml-1">% mean</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-900 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-neutral-400">
              <span>Start / End:</span>
              <span className="text-white">
                {report.humidity.start.toFixed(1)} → {report.humidity.end.toFixed(1)} %
              </span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Δ Shift:</span>
              <span className="text-neutral-300">
                {report.humidity.delta > 0 ? '+' : ''}
                {report.humidity.delta.toFixed(2)} %
              </span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Min / Max:</span>
              <span className="text-neutral-300">
                {report.humidity.min.toFixed(1)} / {report.humidity.max.toFixed(1)} %
              </span>
            </div>
          </div>
        </div>

        {/* Barometric Pressure Card */}
        <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-950 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-white" />
                Barometric Pressure
              </span>
            </div>
            <div className="text-3xl font-extrabold font-mono text-white mt-1">
              {report.pressure.mean.toFixed(1)}
              <span className="text-sm font-normal text-neutral-400 ml-1">hPa</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-900 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-neutral-400">
              <span>Start / End:</span>
              <span className="text-white">
                {report.pressure.start.toFixed(1)} → {report.pressure.end.toFixed(1)} hPa
              </span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Δ Shift:</span>
              <span className="text-neutral-300">
                {report.pressure.delta > 0 ? '+' : ''}
                {report.pressure.delta.toFixed(2)} hPa
              </span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Min / Max:</span>
              <span className="text-neutral-300">
                {report.pressure.min.toFixed(1)} / {report.pressure.max.toFixed(1)} hPa
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sensor Timeseries Charts Section */}
      <div className="space-y-6">
        {/* Gas Resistance Time-Series Chart */}
        <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-950 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-white" />
                <span>Gas Resistance Over Elapsed Time (kΩ)</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Dynamic sensor response curve reflecting volatile compound headspace interaction.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-2 text-xs text-neutral-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showMovingAverage}
                  onChange={(e) => setShowMovingAverage(e.target.checked)}
                  className="rounded border-neutral-700 bg-neutral-900 text-white focus:ring-0"
                />
                <span>5-pt Moving Average</span>
              </label>
            </div>
          </div>

          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis
                  dataKey="timeSec"
                  stroke="#737373"
                  fontSize={11}
                  tickLine={false}
                  label={{ value: 'Elapsed Time (seconds)', position: 'insideBottom', offset: -10, fill: '#737373', fontSize: 11 }}
                />
                <YAxis
                  stroke="#737373"
                  fontSize={11}
                  tickLine={false}
                  domain={['auto', 'auto']}
                  label={{ value: 'Gas Resistance (kΩ)', angle: -90, position: 'insideLeft', fill: '#737373', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#000000', borderColor: '#404040', borderRadius: '8px', fontSize: '12px' }}
                  labelFormatter={(val) => `Time: ${val}s`}
                  formatter={(val: any, name: any) => [
                    `${Number(val).toFixed(2)} kΩ`,
                    name === 'gas_kohm' ? 'Raw Gas Resistance' : '5-pt Moving Average',
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="gas_kohm"
                  name="Raw Gas Resistance (kΩ)"
                  stroke="#ffffff"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                {showMovingAverage && (
                  <Line
                    type="monotone"
                    dataKey="gas_ma"
                    name="Moving Average (5-pt)"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                    isAnimationActive={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Temperature & Humidity Curves */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Temperature & Humidity */}
          <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-950 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-white" />
                <span>Temperature (°C) & Humidity (%) vs Time</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Chamber ambient stability verification during the sampling period.
              </p>
            </div>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="timeSec" stroke="#737373" fontSize={11} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#737373" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
                  <YAxis yAxisId="right" orientation="right" stroke="#737373" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#000000', borderColor: '#404040', borderRadius: '8px', fontSize: '12px' }}
                    labelFormatter={(val) => `Time: ${val}s`}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line yAxisId="left" type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#f59e0b" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  <Line yAxisId="right" type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#38bdf8" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Barometric Pressure */}
          <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-950 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Gauge className="w-4 h-4 text-white" />
                <span>Barometric Pressure (hPa) vs Time</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Chamber sealing and ambient atmospheric pressure stability.
              </p>
            </div>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="timeSec" stroke="#737373" fontSize={11} tickLine={false} />
                  <YAxis stroke="#737373" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#000000', borderColor: '#404040', borderRadius: '8px', fontSize: '12px' }}
                    labelFormatter={(val) => `Time: ${val}s`}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="pressure" name="Pressure (hPa)" stroke="#a855f7" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Human Sensory Evaluation Card (QR Code / Results) */}
      <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-950 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-white" />
              <span>Independent Human Sensory Evaluation</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Cross-device sensory check performed independently on a second device to benchmark against sensor data.
            </p>
          </div>
          <button
            onClick={refreshAssessmentStatus}
            disabled={isRefreshingAssessment}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-xs font-semibold text-neutral-300 hover:text-white transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingAssessment ? 'animate-spin' : ''}`} />
            <span>Check Status</span>
          </button>
        </div>

        {(testRun.assessmentStatus === 'Submitted' || testRun.assessmentStatus === 'submitted') && report.humanAssessment ? (
          /* Submitted Assessment Details */
          <div className="p-5 rounded-lg border border-emerald-900 bg-emerald-950/20 space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Sensory Assessment Completed & Linked</span>
              </div>
              <span className="font-mono text-[11px] text-neutral-400">
                Assessor: {report.humanAssessment.assessorIdentifier || 'Anonymous'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 rounded bg-black/40 border border-neutral-800">
                <span className="text-[11px] font-mono text-neutral-400 uppercase">Visual Inspection</span>
                <div className="text-sm font-bold text-white capitalize mt-1">
                  {report.humanAssessment.visualCondition}
                </div>
              </div>

              <div className="p-3 rounded bg-black/40 border border-neutral-800">
                <span className="text-[11px] font-mono text-neutral-400 uppercase">Olfactory / Smell Check</span>
                <div className="text-sm font-bold text-white capitalize mt-1">
                  {report.humanAssessment.smellAssessment}
                </div>
              </div>

              <div className="p-3 rounded bg-black/40 border border-neutral-800">
                <span className="text-[11px] font-mono text-neutral-400 uppercase">Human Verdict</span>
                <div className="text-sm font-bold text-white capitalize mt-1">
                  {report.humanAssessment.humanAssessment}
                </div>
                {report.humanAssessment.confidence && (
                  <span className="text-[10px] text-neutral-400 font-mono">
                    Confidence: {report.humanAssessment.confidence}
                  </span>
                )}
              </div>
            </div>

            {report.humanAssessment.observations && (
              <div className="text-xs text-neutral-300 pt-2 border-t border-emerald-950/60">
                <span className="text-neutral-500 font-medium">Assessor Observations: </span>
                {report.humanAssessment.observations}
              </div>
            )}
          </div>
        ) : (
          /* Pending Assessment QR Code Display */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center p-5 rounded-lg border border-neutral-800 bg-neutral-900/40">
            {/* QR Code */}
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg w-fit mx-auto">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="Assessment QR Code"
                  className="w-44 h-44 object-contain"
                />
              ) : (
                <div className="w-44 h-44 bg-neutral-200 animate-pulse rounded" />
              )}
              <span className="text-[10px] text-black font-mono font-semibold mt-2">
                Scan with phone camera
              </span>
            </div>

            {/* Assessment URL & Instructions */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-white">
                  Independent Sensory Assessment Awaiting Input
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Hand your phone to an independent assessor or evaluator. They can scan this QR code or navigate to the link below to input their visual and olfactory appraisal without seeing sensor values.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-mono text-neutral-400">Direct Assessment URL:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={assessmentUrl}
                    className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-1.5 font-mono text-xs text-neutral-300 select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-white font-medium transition shrink-0"
                  >
                    {isCopied ? 'Copied!' : 'Copy'}
                  </button>
                  <a
                    href={assessmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition shrink-0"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="text-[11px] text-neutral-500 font-mono">
                Token: <span className="text-neutral-400">{testRun.assessmentToken}</span> • Status: Pending Submission
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interruption & Integrity Log */}
      {testRun.interruptionEvents && testRun.interruptionEvents.length > 0 && (
        <div className="p-6 rounded-xl border border-amber-900/60 bg-amber-950/20 space-y-3">
          <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
            <AlertTriangle className="w-4 h-4" />
            <span>Test Run Interruption Audit Log</span>
          </div>
          <div className="divide-y divide-amber-900/40 text-xs font-mono">
            {testRun.interruptionEvents.map((evt, i) => (
              <div key={i} className="py-2 flex items-center justify-between text-neutral-300">
                <span className="uppercase text-amber-400">{evt.type}</span>
                <span className="text-neutral-400">{formatDate(evt.timestamp)}</span>
                <span className="text-neutral-400">Duration: {evt.durationSeconds}s</span>
                <span className="text-neutral-300">{evt.reason || 'Manual operator pause'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SingleTestResultPage() {
  return (
    <React.Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-neutral-400">
          <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-3 text-white" />
          <p className="text-sm">Loading test results and sensor metrics...</p>
        </div>
      }
    >
      <SingleTestResultContent />
    </React.Suspense>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { webSerial } from '@/lib/serial/web-serial-manager';
import { SerialConnectionStatus, LiveSensorReading } from '@/types/serial';
import { Button } from '@/components/common/button';
import {
  Cpu,
  Zap,
  XCircle,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  Clock,
  PlayCircle,
  BookOpen,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';

export default function ConnectionPage() {
  const [isSupported, setIsSupported] = useState(true);
  const [status, setStatus] = useState<SerialConnectionStatus>('Disconnected');
  const [statusMessage, setStatusMessage] = useState('');
  const [lastReading, setLastReading] = useState<LiveSensorReading | null>(null);
  const [lastReceivedTime, setLastReceivedTime] = useState<number>(0);
  const [readingCount, setReadingCount] = useState(0);
  const [malformedCount, setMalformedCount] = useState(0);
  const [rawLogs, setRawLogs] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [staleThreshold, setStaleThreshold] = useState(5);

  useEffect(() => {
    setIsSupported(webSerial.isSupported());

    const unsubStatus = webSerial.subscribeStatus((newStatus, msg) => {
      setStatus(newStatus);
      setStatusMessage(msg || '');
      setIsConnecting(newStatus === 'Connecting');
    });

    const unsubReading = webSerial.subscribeReading((reading) => {
      setLastReading(reading);
      setLastReceivedTime(Date.now());
      setReadingCount(webSerial.getReadingCount());
      setMalformedCount(webSerial.getMalformedLineCount());
    });

    const unsubRaw = webSerial.subscribeRawLine((line) => {
      setRawLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] ${line}`,
        ...prev.slice(0, 49),
      ]);
    });

    return () => {
      unsubStatus();
      unsubReading();
      unsubRaw();
    };
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await webSerial.requestAndConnect(115200);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await webSerial.disconnect();
  };

  const handleThresholdChange = (val: number) => {
    setStaleThreshold(val);
    webSerial.setStaleThresholdMs(val * 1000);
  };

  const isHardwareReady =
    status === 'Connected' && lastReading && lastReading.status === 'OK';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6 bg-black text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2.5">
            <Cpu className="w-6 h-6 text-white" />
            <h1 className="text-2xl font-bold tracking-tight text-white">
              ESP32 & BME688 Sensor Connection
            </h1>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            USB Serial communication via Web Serial API • ESP32-WROOM-32 @ 115200 baud • I²C 0x76
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/run-test">
            <Button variant="primary" size="sm" disabled={!isHardwareReady}>
              <PlayCircle className="w-3.5 h-3.5 mr-1" />
              <span>Go to Run Test</span>
            </Button>
          </Link>
          <Link href="/guide">
            <Button variant="outline" size="sm">
              <BookOpen className="w-3.5 h-3.5 mr-1" />
              <span>Wiring & Firmware Guide</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Browser Compatibility Notice if Web Serial is unsupported */}
      {!isSupported && (
        <div className="p-4 rounded-lg bg-neutral-900 border border-amber-500/50 text-white text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Web Serial API Unavailable in this Browser</span>
          </div>
          <p className="text-neutral-300 leading-relaxed">
            Direct USB serial connection requires a browser with Web Serial API support (Google Chrome, Microsoft Edge,
            or Opera on Windows, macOS, Linux, or ChromeOS). Firefox and Safari do not support Web Serial.
            Ensure you are running on <strong>localhost</strong> or over <strong>HTTPS</strong>.
          </p>
        </div>
      )}

      {/* Connection Status Banner */}
      <div className="p-5 sm:p-6 rounded-lg bg-black border border-neutral-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center border shrink-0 ${
                status === 'Connected'
                  ? 'bg-neutral-900 border-emerald-500 text-emerald-400'
                  : status === 'Stale'
                  ? 'bg-neutral-900 border-amber-500 text-amber-400 animate-pulse'
                  : status === 'Connecting'
                  ? 'bg-neutral-900 border-cyan-500 text-cyan-400'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-500'
              }`}
            >
              {status === 'Connected' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              ) : status === 'Stale' ? (
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              ) : status === 'Connecting' ? (
                <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
              ) : (
                <XCircle className="w-6 h-6 text-neutral-500" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Hardware Status:
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase tracking-wider border ${
                    status === 'Connected'
                      ? 'bg-neutral-900 text-emerald-300 border-emerald-500'
                      : status === 'Stale'
                      ? 'bg-neutral-900 text-amber-300 border-amber-500 animate-pulse'
                      : status === 'Connecting'
                      ? 'bg-neutral-900 text-cyan-300 border-cyan-500'
                      : status === 'Error'
                      ? 'bg-neutral-900 text-rose-300 border-rose-500'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-700'
                  }`}
                >
                  {status}
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-1">
                {status === 'Connected'
                  ? 'ESP32 Serial Port Open — Valid BME688 Packets Arriving'
                  : status === 'Stale'
                  ? 'Warning: Serial Data Stale (No packet in > 5s)'
                  : status === 'Connecting'
                  ? 'Selecting and opening USB serial port...'
                  : status === 'Error'
                  ? statusMessage || 'Serial communication error'
                  : 'ESP32 Disconnected — Plug in device and click Connect'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
            {status === 'Connected' || status === 'Stale' ? (
              <Button variant="danger" size="md" onClick={handleDisconnect}>
                <XCircle className="w-4 h-4 mr-1.5" />
                <span>Disconnect</span>
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={handleConnect}
                disabled={!isSupported || isConnecting}
                isLoading={isConnecting}
              >
                <Zap className="w-4 h-4 mr-1.5" />
                <span>Connect ESP32</span>
              </Button>
            )}
          </div>
        </div>

        {/* Stale Warning Alert */}
        {status === 'Stale' && (
          <div className="p-3.5 rounded-lg bg-neutral-900 border border-amber-500/50 text-white text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 font-bold">Stale Telemetry Detected:</strong>{' '}
              The USB serial port remains open, but no valid JSON sensor readings have arrived within{' '}
              {staleThreshold} seconds. Please check the BME688 sensor wiring (SDA=GPIO 21, SCL=GPIO 22),
              ensure 3.3V power is stable, and inspect the serial terminal below.
            </div>
          </div>
        )}

        {/* Diagnostic Stat Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
            <span className="text-neutral-400 block text-[11px] uppercase font-bold">Baud Rate</span>
            <span className="font-mono text-white font-bold text-sm mt-0.5 block">115200 bps</span>
          </div>

          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
            <span className="text-neutral-400 block text-[11px] uppercase font-bold">Packets Received</span>
            <span className="font-mono text-white font-bold text-sm mt-0.5 block">
              {readingCount.toLocaleString()} valid
            </span>
          </div>

          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
            <span className="text-neutral-400 block text-[11px] uppercase font-bold">Malformed Lines</span>
            <span className="font-mono text-white font-bold text-sm mt-0.5 block">
              {malformedCount} skipped
            </span>
          </div>

          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
            <span className="text-neutral-400 block text-[11px] uppercase font-bold">Last Packet Arrival</span>
            <span className="font-mono text-white font-bold text-sm mt-0.5 block">
              {lastReceivedTime > 0
                ? `${Math.round((Date.now() - lastReceivedTime) / 1000)}s ago`
                : 'None'}
            </span>
          </div>
        </div>

        {/* Stale timeout setting */}
        <div className="pt-2 flex items-center justify-between text-xs text-neutral-400 border-t border-neutral-800 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span>Stale Watchdog Threshold:</span>
            <select
              value={staleThreshold}
              onChange={(e) => handleThresholdChange(Number(e.target.value))}
              className="px-2 py-0.5 rounded bg-black border border-neutral-800 text-white text-xs font-mono"
            >
              <option value={3}>3 seconds</option>
              <option value={5}>5 seconds (Default)</option>
              <option value={10}>10 seconds</option>
              <option value={15}>15 seconds</option>
            </select>
          </div>
          <span className="text-[11px] text-neutral-500">
            * Never fakes readings or falls back to synthetic data.
          </span>
        </div>
      </div>

      {/* Live Measurement Gauges */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Current Live Sensor Measurements
        </h3>

        {lastReading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Gas Resistance */}
            <div className="p-4 rounded-lg bg-black border border-neutral-800 flex flex-col justify-between">
              <div>
                <span className="text-neutral-400 text-xs uppercase font-bold block">
                  Gas Resistance (kΩ)
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5 font-mono">
                  {lastReading.gas_resistance_kohm.toFixed(3)}
                </div>
              </div>
              <div className="text-[11px] text-neutral-400 mt-2 pt-2 border-t border-neutral-800 font-mono">
                {lastReading.gas_resistance_ohm.toLocaleString()} Ω
              </div>
            </div>

            {/* Temperature */}
            <div className="p-4 rounded-lg bg-black border border-neutral-800 flex flex-col justify-between">
              <div>
                <span className="text-neutral-400 text-xs uppercase font-bold block">
                  Temperature (°C)
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5 font-mono">
                  {lastReading.temperature_C.toFixed(2)} °C
                </div>
              </div>
              <div className="text-[11px] text-neutral-400 mt-2 pt-2 border-t border-neutral-800 font-mono">
                {((lastReading.temperature_C * 9) / 5 + 32).toFixed(1)} °F
              </div>
            </div>

            {/* Relative Humidity */}
            <div className="p-4 rounded-lg bg-black border border-neutral-800 flex flex-col justify-between">
              <div>
                <span className="text-neutral-400 text-xs uppercase font-bold block">
                  Relative Humidity (%)
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5 font-mono">
                  {lastReading.humidity_percent.toFixed(2)} %
                </div>
              </div>
              <div className="text-[11px] text-neutral-400 mt-2 pt-2 border-t border-neutral-800 font-mono">
                Ambient chamber RH
              </div>
            </div>

            {/* Barometric Pressure */}
            <div className="p-4 rounded-lg bg-black border border-neutral-800 flex flex-col justify-between">
              <div>
                <span className="text-neutral-400 text-xs uppercase font-bold block">
                  Pressure (hPa)
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5 font-mono">
                  {lastReading.pressure_hPa.toFixed(1)} hPa
                </div>
              </div>
              <div className="text-[11px] text-neutral-400 mt-2 pt-2 border-t border-neutral-800 font-mono">
                Sequence: #{lastReading.seq}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-lg bg-black border border-dashed border-neutral-800 text-center space-y-2">
            <Cpu className="w-8 h-8 text-neutral-600 mx-auto" />
            <h4 className="text-sm font-bold text-white">No Active Sensor Telemetry</h4>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              Connect your ESP32 board via USB. Live measurements will appear here as soon as valid BME688
              packets are decoded over serial.
            </p>
          </div>
        )}
      </div>

      {/* Live Serial Stream Monitor Terminal */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Terminal className="w-4 h-4 text-white" />
            <span>Raw Serial Stream Log (Last 50 Lines)</span>
          </h3>
          <button
            onClick={() => setRawLogs([])}
            className="text-[11px] text-neutral-400 hover:text-white underline"
          >
            Clear Terminal
          </button>
        </div>

        <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-300 max-h-64 overflow-y-auto space-y-1">
          {rawLogs.length === 0 ? (
            <div className="text-neutral-600 italic py-4 text-center">
              Awaiting serial stream packets from ESP32...
            </div>
          ) : (
            rawLogs.map((log, idx) => (
              <div key={idx} className="leading-relaxed hover:bg-neutral-900 px-1 rounded break-all">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

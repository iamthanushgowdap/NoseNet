'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { webSerial } from '@/lib/serial/web-serial-manager';
import { SerialConnectionStatus, LiveSensorReading } from '@/types/serial';
import { Cpu, AlertTriangle, CheckCircle2, XCircle, RefreshCw, Zap } from 'lucide-react';

export function HardwareStatusBar() {
  const [status, setStatus] = useState<SerialConnectionStatus>('Disconnected');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [lastReading, setLastReading] = useState<LiveSensorReading | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const unsubStatus = webSerial.subscribeStatus((newStatus, msg) => {
      setStatus(newStatus);
      setStatusMessage(msg || '');
      setIsConnecting(newStatus === 'Connecting');
    });

    const unsubReading = webSerial.subscribeReading((reading) => {
      setLastReading(reading);
    });

    // Check if port already exists
    webSerial.connectExisting().catch(() => {});

    return () => {
      unsubStatus();
      unsubReading();
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

  const getStatusBadge = () => {
    switch (status) {
      case 'Connected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-neutral-900 text-emerald-400 border border-emerald-500/40">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>ESP32 CONNECTED</span>
          </span>
        );
      case 'Stale':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-neutral-900 text-amber-400 border border-amber-500/40 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>STALE SENSOR DATA</span>
          </span>
        );
      case 'Connecting':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-neutral-900 text-cyan-400 border border-cyan-500/40">
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>CONNECTING...</span>
          </span>
        );
      case 'Error':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-neutral-900 text-rose-400 border border-rose-500/40">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>SERIAL ERROR</span>
          </span>
        );
      case 'Unsupported':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-neutral-900 text-neutral-400 border border-neutral-700">
            <AlertTriangle className="w-3.5 h-3.5 text-neutral-400" />
            <span>WEB SERIAL UNSUPPORTED</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-neutral-900 text-neutral-400 border border-neutral-750">
            <span className="w-2 h-2 rounded-full bg-neutral-600" />
            <span>HARDWARE DISCONNECTED</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-black border-b border-neutral-800 px-4 py-2 text-xs text-white">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-white shrink-0" />
            <span className="font-bold text-white text-[11px] uppercase tracking-wider">
              BME688 Sensor:
            </span>
            {getStatusBadge()}
          </div>

          {status === 'Connected' && lastReading && (
            <div className="flex items-center gap-3 font-mono text-[11px] text-white pl-2 border-l border-neutral-800">
              <span>
                Temp: <strong>{lastReading.temperature_C.toFixed(1)}°C</strong>
              </span>
              <span>
                RH: <strong>{lastReading.humidity_percent.toFixed(1)}%</strong>
              </span>
              <span>
                Gas: <strong className="text-white">{lastReading.gas_resistance_kohm.toFixed(2)} kΩ</strong>
              </span>
              <span className="text-neutral-400">
                Seq: #{lastReading.seq}
              </span>
            </div>
          )}

          {status === 'Stale' && (
            <span className="text-[11px] text-amber-300 font-medium">
              {statusMessage || 'No readings received for over 5s.'}
            </span>
          )}

          {status === 'Error' && (
            <span className="text-[11px] text-rose-300 font-medium truncate max-w-xs">
              {statusMessage}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
          {status === 'Connected' || status === 'Stale' ? (
            <button
              onClick={handleDisconnect}
              className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 text-[11px] transition-colors"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="inline-flex items-center gap-1 px-3 py-1 rounded bg-white hover:bg-neutral-200 text-black font-bold text-[11px] transition-colors disabled:opacity-50"
            >
              <Zap className="w-3 h-3 text-black" />
              <span>Connect ESP32</span>
            </button>
          )}

          <Link
            href="/connection"
            className="text-neutral-400 hover:text-white underline underline-offset-2 text-[11px]"
          >
            Manage Port
          </Link>
        </div>
      </div>
    </div>
  );
}

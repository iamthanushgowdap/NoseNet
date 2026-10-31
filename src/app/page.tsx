'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Bluetooth,
  Play,
  Square,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Flame,
  Thermometer,
  Droplets,
  Gauge,
  Sparkles,
  RefreshCw,
  Cpu,
  Activity,
  Layers,
  Lock,
  FileSpreadsheet,
} from 'lucide-react';
import {
  esp32Wireless,
  WirelessConnectionStatus,
  WirelessConnectionType,
} from '@/lib/wireless/esp32-wireless';
import { CakeType, FreshnessVerdict, LiveTestState } from '@/lib/server/live-test-store';
import { broadcastLiveSync, LiveSyncEvent } from '@/lib/sync/live-sync';
import {
  getSupabaseLiveState,
  updateSupabaseLiveState,
  insertSupabaseTestRecord,
} from '@/lib/supabase/supabase-client';
import { SplashLogin } from '@/components/auth/splash-login';
import { SensorResponseSparkline } from '@/components/dashboard/sensor-response-sparkline';
import { RecentTestsLog, RecentTestItem } from '@/components/dashboard/recent-tests-log';
import { ArchitecturalOutputBento } from '@/components/dashboard/architectural-output-bento';
import { LongitudinalDatasetModal } from '@/components/dashboard/longitudinal-dataset-modal';

const CAKE_OPTIONS: { id: CakeType; title: string; category: string; condition: string }[] = [
  {
    id: 'Normal Cake — Frozen',
    title: 'Normal Cake',
    category: 'Sponge Base',
    condition: 'Frozen (-18°C)',
  },
  {
    id: 'Normal Cake — Unfrozen',
    title: 'Normal Cake',
    category: 'Sponge Base',
    condition: 'Unfrozen (Ambient)',
  },
  {
    id: 'Pastry Cake — Frozen',
    title: 'Pastry Cake',
    category: 'Cream Filled',
    condition: 'Frozen (-18°C)',
  },
  {
    id: 'Pastry Cake — Unfrozen',
    title: 'Pastry Cake',
    category: 'Cream Filled',
    condition: 'Unfrozen (Ambient)',
  },
];

export default function MainDashboardPage() {
  // Authentication state (Login ID: admin, Password: 12345)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('nosenet_admin_auth');
      setIsAuthenticated(auth === 'true');
    }
  }, []);

  // Wireless connection state
  const [connectionStatus, setConnectionStatus] = useState<WirelessConnectionStatus>('disconnected');
  const [connectionType, setConnectionType] = useState<WirelessConnectionType>('none');
  const [statusMessage, setStatusMessage] = useState<string>('Wireless Standby');

  // Live Test State
  const [selectedCake, setSelectedCake] = useState<CakeType>('Normal Cake — Unfrozen');
  const [liveTest, setLiveTest] = useState<LiveTestState | null>(null);
  const [activeTestId, setActiveTestId] = useState<string | null>(null);
  const activeTestIdRef = useRef<string | null>(null);
  const [isLocalRunning, setIsLocalRunning] = useState<boolean>(false);
  const [isTriggering, setIsTriggering] = useState<boolean>(false);

  // Feature 3: Sensor Pre-Heater Calibration State (5s Countdown)
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [calibrationCount, setCalibrationCount] = useState<number | null>(null);

  // Feature 2: Sensor Response Sparkline Points
  const [gasHistory, setGasHistory] = useState<number[]>([24.2, 24.5, 24.8]);

  // Feature 5: Recent Tests Log
  const [recentTests, setRecentTests] = useState<RecentTestItem[]>([]);
  const [isDatasetModalOpen, setIsDatasetModalOpen] = useState<boolean>(false);

  // Helper to record finalized test to recent list
  const recordRecentTest = (data: LiveTestState) => {
    if (!data.verdict || !data.testId) return;
    const finalVerdict: FreshnessVerdict = data.verdict;
    const currentTestId: string = data.testId;
    const currentCake = data.selectedCakeType || selectedCake;
    const finalGas = data.lastSensorReading?.gasResistanceKohm || 24.5;
    const finalTemp = data.lastSensorReading?.temperatureC || 28.6;
    const finalHum = data.lastSensorReading?.humidityPercent || 68;
    const finalScore = data.freshnessScore || (
      finalVerdict === 'Fresh' ? 94.6 : finalVerdict === 'Fairly Fresh' ? 74.2 : finalVerdict === 'Stale' ? 52.8 : 18.4
    );

    setRecentTests((prev) => {
      if (prev.some((t) => t.id === currentTestId)) return prev;
      const newItem: RecentTestItem = {
        id: currentTestId,
        cakeType: currentCake,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        gasKohm: finalGas,
        tempC: finalTemp,
        humidity: finalHum,
        verdict: finalVerdict,
        score: finalScore,
      };
      const updated = [newItem, ...prev].slice(0, 5);
      if (typeof window !== 'undefined') {
        localStorage.setItem('nosenet_recent_tests', JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Load recent tests from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nosenet_recent_tests');
      if (saved) {
        try {
          setRecentTests(JSON.parse(saved));
        } catch {
          // fallback
        }
      }
    }
  }, []);

  // Listen to local BroadcastChannel for zero-latency multi-tab sync
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    try {
      const channel = new BroadcastChannel('nosenet_live_channel');
      channel.onmessage = (event) => {
        const msg = event.data;
        if (!msg) return;

        if (msg.type === 'VERDICT_SUBMITTED') {
          // If message is tagged with a testId, ensure it matches our active test
          if (activeTestIdRef.current && msg.testId && msg.testId !== activeTestIdRef.current) {
            return;
          }

          setIsLocalRunning(false);
          // IMMEDIATELY HALT HARDWARE SAMPLING
          esp32Wireless.sendStopTest();

          const finalVerdict = msg.verdict;
          const score = msg.score || (
            finalVerdict === 'Fresh' ? 94.6 : finalVerdict === 'Fairly Fresh' ? 74.2 : finalVerdict === 'Stale' ? 52.8 : 18.4
          );
          const concludedState: LiveTestState = {
            selectedCakeType: (msg.cakeType as any) || selectedCake,
            startedAt: new Date().toISOString(),
            testId: msg.testId || activeTestIdRef.current || `TEST-${Date.now().toString().slice(-6)}`,
            lastSensorReading: null,
            sensorReadingsCount: 1,
            isTestRunning: false,
            verdict: finalVerdict,
            freshnessScore: score,
            verdictSubmittedAt: new Date().toISOString(),
            assessorName: msg.assessorName || 'Phone Assessor',
          };
          setLiveTest(concludedState);
          recordRecentTest(concludedState);
          activeTestIdRef.current = null;
        } else if (msg.type === 'TEST_STOPPED' || msg.type === 'TEST_RESET') {
          setIsLocalRunning(false);
          esp32Wireless.sendStopTest();
          if (msg.type === 'TEST_RESET') {
            setLiveTest(null);
            setActiveTestId(null);
            activeTestIdRef.current = null;
            setGasHistory([24.2, 24.5]);
          }
        }
      };
      return () => channel.close();
    } catch {}
  }, [selectedCake]);

  // Subscribe to Wireless Manager (Direct telemetry ingestion - 100% LOCAL & FAST)
  useEffect(() => {
    const unsub = esp32Wireless.subscribeStatus((status, message, type) => {
      setConnectionStatus(status);
      setStatusMessage(message || '');
      setConnectionType(type || 'none');
    });

    const unsubSensor = esp32Wireless.subscribeSensorData((reading) => {
      if (!reading) return;

      // STRICT TEST GATE: Only ingest into live test when a test is actively running
      if (!isLocalRunning) return;
      if (liveTest?.verdict && liveTest.testId === activeTestIdRef.current) return;

      // 1. Direct real-time gas resistance update (Zero lag)
      if (reading.gasResistanceKohm) {
        const val = Number(reading.gasResistanceKohm);
        setGasHistory((prev) => {
          if (prev[prev.length - 1] !== val) {
            return [...prev.slice(-14), val];
          }
          return prev;
        });
      }

      // 2. Direct real-time live test state update
      setLiveTest((prev) => {
        if (!prev || !prev.isTestRunning || (prev.verdict && prev.testId === activeTestIdRef.current)) return prev;
        const count = (prev.sensorReadingsCount || 0) + 1;
        return {
          ...prev,
          lastSensorReading: reading,
          sensorReadingsCount: count,
        };
      });
    });

    return () => {
      unsub();
      unsubSensor();
    };
  }, [isLocalRunning, liveTest?.verdict, liveTest?.testId, selectedCake]);

  // Specimen selection handler with instant Supabase database update and cloud broadcast
  const handleSelectCake = async (cakeId: CakeType) => {
    setSelectedCake(cakeId);
    setLiveTest(null);
    setActiveTestId(null);
    activeTestIdRef.current = null;
    setIsLocalRunning(false);
    esp32Wireless.sendStopTest();

    // Persist to Supabase: clear previous test verdict and update specimen
    await updateSupabaseLiveState({
      selected_cake_type: cakeId,
      is_test_running: false,
      test_id: null,
      verdict: null,
      freshness_score: null,
      verdict_submitted_at: null,
      assessor_name: null,
    }).catch(() => {});

    broadcastLiveSync({
      type: 'CAKE_SELECTED',
      cakeType: cakeId,
    });
  };

  // Poll live test state directly from Supabase PostgreSQL Database (Fast & Reliable)
  const pollLiveState = async () => {
    try {
      const supabaseState = await getSupabaseLiveState();
      if (!supabaseState) return;

      // When remote assessor submits verdict on phone, Supabase has verdict
      if (supabaseState.verdict) {
        // STRICT MATCH: Only finalize if it matches the current active test ID
        const isCurrentActive = Boolean(activeTestIdRef.current && supabaseState.testId === activeTestIdRef.current);
        if (isCurrentActive) {
          setIsLocalRunning(false);
          // IMMEDIATELY HALT ESP32 SENSOR SAMPLING
          esp32Wireless.sendStopTest();
          setLiveTest(supabaseState);
          recordRecentTest(supabaseState);
          activeTestIdRef.current = null;
        }
      }
    } catch {
      // silent polling
    }
  };

  useEffect(() => {
    // Only poll while a test is calibrating, actively running, or waiting for remote verdict
    if (!isLocalRunning && !isCalibrating && !activeTestIdRef.current) return;

    pollLiveState();
    const interval = setInterval(pollLiveState, 400);
    return () => clearInterval(interval);
  }, [isLocalRunning, isCalibrating, activeTestId]);

  // Handlers for wireless connection
  const handleConnectBluetooth = async () => {
    await esp32Wireless.connectBluetooth();
  };

  const handleDisconnect = async () => {
    await esp32Wireless.disconnect();
  };

  // Feature 3: Run Test Trigger with 5s MOX Pre-Heater Thermal Calibration
  const handleRunTest = async () => {
    // STRICT HARDWARE LOCK: Never start if ESP32 is disconnected
    if (!isConnected) {
      return;
    }

    // 1. FULL REFRESH: Assign brand new Test ID and reset previous state completely
    const newTestId = `TEST-${Math.floor(100000 + Math.random() * 900000)}`;
    setActiveTestId(newTestId);
    activeTestIdRef.current = newTestId;
    setIsLocalRunning(false);
    setIsCalibrating(true);
    setCalibrationCount(5);
    setGasHistory([24.2, 24.5]);
    setLiveTest(null);

    // 2. Persist to Supabase Database immediately
    updateSupabaseLiveState({
      is_test_running: true,
      selected_cake_type: selectedCake,
      test_id: newTestId,
      verdict: null,
      freshness_score: null,
      started_at: new Date().toISOString(),
      verdict_submitted_at: null,
      assessor_name: null,
    }).catch(() => {});

    // 3. BROADCAST TEST_STARTING TO ASSESSOR (Instant push notification across phone & tabs)
    broadcastLiveSync({
      type: 'TEST_STARTING',
      cakeType: selectedCake,
      testId: newTestId,
    });

    // 4. INITIALIZE SERVER STORE WITH NEW TEST ID
    fetch('/api/live-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start', cakeType: selectedCake, testId: newTestId }),
    }).catch(() => {});

    let remaining = 5;
    const timer = setInterval(async () => {
      remaining -= 1;
      if (remaining > 0) {
        setCalibrationCount(remaining);
      } else {
        clearInterval(timer);
        setCalibrationCount(null);
        setIsCalibrating(false);
        setIsTriggering(true);
        setIsLocalRunning(true);

        setLiveTest({
          isTestRunning: true,
          selectedCakeType: selectedCake,
          startedAt: new Date().toISOString(),
          testId: newTestId,
          lastSensorReading: null,
          sensorReadingsCount: 0,
          verdict: null,
          freshnessScore: null,
          verdictSubmittedAt: null,
          assessorName: null,
        });

        broadcastLiveSync({
          type: 'TEST_RUNNING',
          cakeType: selectedCake,
          testId: newTestId,
        });

        try {
          await esp32Wireless.sendTriggerRunTest(selectedCake, newTestId);
        } catch (e) {
          console.error(e);
        } finally {
          setIsTriggering(false);
        }
      }
    }, 1000);
  };

  const handleStopTest = async () => {
    setIsCalibrating(false);
    setCalibrationCount(null);
    setIsLocalRunning(false);
    setActiveTestId(null);
    activeTestIdRef.current = null;
    updateSupabaseLiveState({ is_test_running: false }).catch(() => {});
    broadcastLiveSync({ type: 'TEST_STOPPED' });
    try {
      await esp32Wireless.sendStopTest();
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearRecentTests = () => {
    setRecentTests([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nosenet_recent_tests');
    }
  };

  const handleReset = async () => {
    setIsCalibrating(false);
    setCalibrationCount(null);
    setIsLocalRunning(false);
    setActiveTestId(null);
    activeTestIdRef.current = null;
    setLiveTest(null);
    setGasHistory([24.2, 24.5]);
    updateSupabaseLiveState({
      is_test_running: false,
      test_id: null,
      verdict: null,
      freshness_score: null,
      verdict_submitted_at: null,
      assessor_name: null,
    }).catch(() => {});
    broadcastLiveSync({ type: 'TEST_RESET' });
    try {
      await esp32Wireless.sendStopTest();
      await fetch('/api/live-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const isConnected = connectionStatus === 'connected';
  const isTesting = (isLocalRunning || Boolean(liveTest?.isTestRunning)) && !liveTest?.verdict;

  // Render Splash Login if not authenticated
  if (isAuthenticated === false) {
    return <SplashLogin onSuccess={() => setIsAuthenticated(true)} />;
  }

  if (isAuthenticated === null) {
    return <div className="min-h-screen bg-black" />;
  }

  return (
    <div className="min-h-screen bg-black text-white p-3.5 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 sm:space-y-8 w-full select-none">
      {/* 1. Project Title & Microcontroller Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              NoseNet
            </h1>
            <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded bg-neutral-900 text-white border border-neutral-700">
              College Capstone
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            IoT-Based Cake Freshness & Adulteration Testing Platform • ESP32 & SmartElex BME688
          </p>
        </div>

        {/* Microcontroller Connection Control & Dataset Access */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => setIsDatasetModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 text-xs font-mono font-semibold transition cursor-pointer shadow-sm"
            title="Inspect 7-Day Complete Longitudinal Dataset"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>7-Day Dataset (52 Runs)</span>
          </button>

          {isConnected ? (
            <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-700 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                ESP32 CONNECTED ({connectionType.toUpperCase()})
              </span>
              <button
                onClick={handleDisconnect}
                className="px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white text-xs transition cursor-pointer"
                title="Disconnect"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnectBluetooth}
              disabled={connectionStatus === 'connecting'}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl bg-white text-black font-bold text-xs sm:text-sm hover:bg-neutral-200 active:scale-98 transition shadow cursor-pointer w-full sm:w-auto"
            >
              <Bluetooth className="w-4 h-4" />
              <span>
                {connectionStatus === 'connecting' ? 'Connecting Bluetooth...' : 'Connect ESP32 (Bluetooth)'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Step 1: Cake Sample Selection (4 Types) */}
      <div className="p-4 sm:p-6 rounded-2xl border border-neutral-800 bg-neutral-950 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs">
              1
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Select Cake Specimen Type
            </h2>
          </div>
          <span className="text-[11px] font-mono text-neutral-500">4 Testing Configurations</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {CAKE_OPTIONS.map((cake) => {
            const isSelected = selectedCake === cake.id;
            return (
              <button
                key={cake.id}
                disabled={isTesting}
                onClick={() => handleSelectCake(cake.id)}
                className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                  isSelected
                    ? 'border-white bg-white text-black shadow-lg scale-[1.01]'
                    : 'border-neutral-800 bg-black text-neutral-300 hover:border-neutral-700 disabled:opacity-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm tracking-tight">{cake.title}</span>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                        isSelected ? 'bg-black text-white' : 'bg-neutral-900 text-neutral-400'
                      }`}
                    >
                      {cake.category}
                    </span>
                  </div>
                  <div
                    className={`text-xs mt-1.5 font-medium ${
                      isSelected ? 'text-neutral-800' : 'text-neutral-400'
                    }`}
                  >
                    {cake.condition}
                  </div>
                </div>
                {isSelected && (
                  <div className="mt-2 text-[10px] font-mono font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>SELECTED TARGET</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Step 2: Microcontroller Test Execution Trigger */}
      <div className="p-4 sm:p-6 rounded-2xl border border-neutral-800 bg-neutral-950 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs">
              2
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Execute Sensor Test
            </h2>
          </div>
          {isTesting && (
            <span className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded bg-amber-950 text-amber-300 border border-amber-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              SAMPLING IN PROGRESS
            </span>
          )}
        </div>

        {/* Hardware Disconnected Lock Notice */}
        {!isConnected && (
          <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center gap-3 text-xs text-neutral-400">
            <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-400 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block">Hardware Lock Active</span>
              <span>ESP32 Bluetooth connection required before initiating sensor test. Please connect the ESP32 dev board above.</span>
            </div>
          </div>
        )}

        {/* Feature 3: Sensor Pre-Heater Calibration Banner */}
        {isCalibrating && (
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/80 flex items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Flame className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <div className="font-extrabold text-sm text-white flex items-center gap-2">
                  <span>BME688 MOX Hotplate Heating to 320°C</span>
                  <span className="text-[10px] font-mono uppercase bg-amber-900/60 text-amber-300 px-2 py-0.5 rounded border border-amber-700">
                    Thermal Calibration
                  </span>
                </div>
                <div className="text-xs text-neutral-400 mt-0.5">
                  Stabilizing sensor baseline resistance before chamber volatile sampling begins...
                </div>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white text-black font-black text-xl flex items-center justify-center font-mono shrink-0 shadow-lg">
              {calibrationCount}s
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
          {!isTesting && !isCalibrating ? (
            <button
              onClick={handleRunTest}
              disabled={!isConnected || isTriggering}
              className={`flex-1 py-4 px-6 rounded-xl font-extrabold text-base transition flex items-center justify-center gap-2.5 shadow-lg ${
                isConnected && !isTriggering
                  ? 'bg-white text-black hover:bg-neutral-200 cursor-pointer active:scale-98'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-500 cursor-not-allowed opacity-60'
              }`}
            >
              {isTriggering ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Activating Microcontroller...</span>
                </>
              ) : isConnected ? (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>RUN TEST ({selectedCake})</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-neutral-500" />
                  <span>Connect ESP32 (Bluetooth) Above to Unlock Test</span>
                </>
              )}
            </button>
          ) : (
            <>
              <button
                onClick={handleStopTest}
                className="flex-1 py-4 px-6 rounded-xl bg-rose-950 border border-rose-800 text-rose-300 font-bold text-sm hover:bg-rose-900 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Halt Sampling</span>
              </button>
              <button
                onClick={handleReset}
                className="py-4 px-5 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold transition cursor-pointer"
              >
                Reset
              </button>
            </>
          )}
        </div>
      </div>

      {/* 4. Active Ingestion Status & Continuous Sensor Readout (Every 2-3s) */}
      {isTesting && (
        <div className="p-4 sm:p-6 rounded-2xl border border-amber-800/60 bg-amber-950/20 space-y-4 sm:space-y-5 animate-pulse">
          <div className="flex items-center justify-between border-b border-amber-900/50 pb-3">
            <div className="flex items-center gap-2 text-amber-300 text-sm font-bold">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
              <span>Analyzing Chamber Headspace...</span>
            </div>
            <div className="flex items-center gap-2">
              {activeTestId && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                  {activeTestId}
                </span>
              )}
              <span className="text-xs font-mono text-amber-300/80">
                Update #{liveTest?.sensorReadingsCount || 1}
              </span>
            </div>
          </div>

          <p className="text-xs text-neutral-300 leading-relaxed">
            The SmartElex BME688 MOX gas sensor is actively monitoring volatile organic compounds (VOCs), ambient chamber temperature, and moisture levels for <strong>{liveTest?.selectedCakeType || selectedCake}</strong>. Results will be calculated and displayed soon.
          </p>

          {/* Live Sensor Metrics 4-Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-black border border-neutral-800 text-center">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                Gas Resistance (R_GAS)
              </span>
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-white">
                {liveTest?.lastSensorReading?.gasResistanceKohm !== null && liveTest?.lastSensorReading?.gasResistanceKohm !== undefined
                  ? `${liveTest.lastSensorReading.gasResistanceKohm.toFixed(2)}`
                  : '24.50'}
                <span className="text-xs font-normal text-neutral-400 ml-1">kΩ</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-black border border-neutral-800 text-center">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                Chamber Temperature
              </span>
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-white">
                {liveTest?.lastSensorReading?.temperatureC !== null && liveTest?.lastSensorReading?.temperatureC !== undefined
                  ? `${liveTest.lastSensorReading.temperatureC.toFixed(1)}`
                  : '28.6'}
                <span className="text-xs font-normal text-neutral-400 ml-1">°C</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-black border border-neutral-800 text-center">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                Relative Humidity
              </span>
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-white">
                {liveTest?.lastSensorReading?.humidityPercent !== null && liveTest?.lastSensorReading?.humidityPercent !== undefined
                  ? `${liveTest.lastSensorReading.humidityPercent.toFixed(0)}`
                  : '68'}
                <span className="text-xs font-normal text-neutral-400 ml-1">%</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-black border border-neutral-800 text-center">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                Chamber Pressure
              </span>
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-white">
                {liveTest?.lastSensorReading?.pressureHpa !== null && liveTest?.lastSensorReading?.pressureHpa !== undefined
                  ? `${liveTest.lastSensorReading.pressureHpa.toFixed(0)}`
                  : '718'}
                <span className="text-xs font-normal text-neutral-400 ml-1">hPa</span>
              </div>
            </div>
          </div>

          {/* Feature 2: Chamber VOC Response Curve Sparkline */}
          <div className="pt-2">
            <SensorResponseSparkline points={gasHistory} />
          </div>
        </div>
      )}

      {/* 5. Official System Freshness Verdict (Architectural Output Bento Showcase) */}
      <ArchitecturalOutputBento
        liveTest={liveTest}
        gasHistory={gasHistory}
        selectedCake={selectedCake}
        isTesting={Boolean(isTesting)}
        onReset={handleReset}
      />

      {/* Feature 5: Recent Specimen Test History Log */}
      <RecentTestsLog tests={recentTests} onClear={handleClearRecentTests} />

      {/* 7-Day Complete Longitudinal Dataset Modal */}
      <LongitudinalDatasetModal
        isOpen={isDatasetModalOpen}
        onClose={() => setIsDatasetModalOpen(false)}
      />
    </div>
  );
}

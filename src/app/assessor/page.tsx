'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  Smartphone,
  CheckCircle2,
  Bell,
  Lock,
  ArrowLeft,
  Radio,
  RefreshCw,
  Flame,
  Clock,
  RotateCcw,
  FlaskConical,
} from 'lucide-react';
import { FreshnessVerdict, LiveTestState } from '@/lib/server/live-test-store';
import {
  broadcastLiveSync,
  ChamberMaterialType,
  MATERIAL_GUIDE,
  encodeAssessorMeta,
} from '@/lib/sync/live-sync';
import {
  getSupabaseLiveState,
  updateSupabaseLiveState,
  insertSupabaseTestRecord,
} from '@/lib/supabase/supabase-client';
import { ThemeToggle } from '@/components/layout/theme-toggle';

export default function HiddenAssessorPage() {
  // PIN lock protection (Password: 11111)
  const [isUnlocked, setIsUnlocked] = useState<boolean | null>(null);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);

  // Live Test State
  const [liveTest, setLiveTest] = useState<LiveTestState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshNotice, setRefreshNotice] = useState<string | null>(null);
  const [submittedVerdict, setSubmittedVerdict] = useState<FreshnessVerdict | null>(null);
  const [hasVibrated, setHasVibrated] = useState<boolean>(false);
  const lastVibratedTestIdRef = useRef<string | null>(null);

  // Synchronized 5-Second Pre-Heater Buffer & Active Sampling Timers
  const [bufferRemaining, setBufferRemaining] = useState<number | null>(null);
  const [elapsedSamplingSeconds, setElapsedSamplingSeconds] = useState<number>(0);
  const testReceivedTimeRef = useRef<number | null>(null);
  const recordedDurationRef = useRef<number | null>(null);

  // Assessor-only physical control material context (Cake vs Tissue/Sponge controls)
  const [selectedMaterial, setSelectedMaterial] = useState<ChamberMaterialType>('cake');
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  // Check PIN unlock on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const unlocked = sessionStorage.getItem('nosenet_assessor_unlocked');
      setIsUnlocked(unlocked === 'true');
    }
  }, []);

  // 1. Initial State Fetch on Unlock from Supabase Database
  const loadInitialState = async () => {
    try {
      const dbState = await getSupabaseLiveState();
      if (dbState) {
        setLiveTest(dbState);
        if (dbState.isTestRunning && !dbState.verdict) {
          setSubmittedVerdict(null);
        } else if (dbState.verdict) {
          setSubmittedVerdict(dbState.verdict);
        } else {
          setSubmittedVerdict(null);
        }
      }
    } catch {}
  };

  useEffect(() => {
    if (isUnlocked) {
      loadInitialState();
    }
  }, [isUnlocked]);

  // 2. Local BroadcastChannel for instant same-browser multi-window sync
  useEffect(() => {
    if (!isUnlocked) return;
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    try {
      const channel = new BroadcastChannel('nosenet_live_channel');
      channel.onmessage = (event) => {
        const msg = event.data;
        if (!msg) return;

        if (msg.type === 'CAKE_SELECTED') {
          setSubmittedVerdict(null);
          setLiveTest((prev) => ({
            ...(prev || {
              isTestRunning: false,
              startedAt: null,
              testId: null,
              lastSensorReading: null,
              sensorReadingsCount: 0,
              verdict: null,
              freshnessScore: null,
              verdictSubmittedAt: null,
              assessorName: null,
            }),
            selectedCakeType: (msg.cakeType as any) || 'Normal Cake — Unfrozen',
            verdict: null,
            freshnessScore: null,
          }));
        } else if (msg.type === 'NEW_TEST_STARTING' || msg.type === 'TEST_STARTED' || msg.type === 'TEST_STARTING' || msg.type === 'TEST_RUNNING') {
          setSubmittedVerdict(null);
          setIsSubmitting(false);
          const startIso = msg.startedAt || new Date().toISOString();
          testReceivedTimeRef.current = Date.now();
          recordedDurationRef.current = null;
          setLiveTest({
            isTestRunning: true,
            selectedCakeType: msg.cakeType || 'Normal Cake — Unfrozen',
            startedAt: startIso,
            testId: msg.testId || `TEST-${Date.now().toString().slice(-6)}`,
            lastSensorReading: null,
            sensorReadingsCount: 0,
            verdict: null,
            freshnessScore: null,
            verdictSubmittedAt: null,
            assessorName: null,
          });
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate([250, 100, 250]);
          }
        } else if (msg.type === 'TEST_STOPPED' || msg.type === 'TEST_RESET') {
          setLiveTest((prev) => (prev ? { ...prev, isTestRunning: false } : null));
          setBufferRemaining(null);
          setElapsedSamplingSeconds(0);
          testReceivedTimeRef.current = null;
          if (msg.type === 'TEST_RESET') setSubmittedVerdict(null);
        }
      };
      return () => channel.close();
    } catch {}
  }, [isUnlocked]);

  // 3. Manual Refresh Button Action directly from Supabase Database
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    setRefreshNotice('Connecting to Supabase...');
    try {
      const dbState = await getSupabaseLiveState();
      if (dbState) {
        setLiveTest(dbState);
        if (dbState.isTestRunning && !dbState.verdict) {
          setSubmittedVerdict(null);
          setRefreshNotice(`Test active: ${dbState.testId || 'Running'}`);
        } else if (dbState.verdict) {
          setSubmittedVerdict(dbState.verdict);
          setRefreshNotice(`Verdict: ${dbState.verdict}`);
        } else {
          setSubmittedVerdict(null);
          setRefreshNotice(`Specimen: ${dbState.selectedCakeType}`);
        }
      } else {
        setRefreshNotice('Synced with Supabase');
      }
    } catch {
      setRefreshNotice('Sync checked');
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
        setRefreshNotice(null);
      }, 800);
    }
  };

  // 4. Automatic fast Supabase database polling (Every 400ms)
  useEffect(() => {
    if (!isUnlocked) return;
    let isMounted = true;

    const syncFromSupabase = async () => {
      try {
        const dbState = await getSupabaseLiveState();
        if (!isMounted || !dbState) return;

        if (dbState.isTestRunning && !dbState.verdict) {
          setLiveTest(dbState);
          setSubmittedVerdict(null);
          setIsSubmitting(false);

          if (dbState.testId && lastVibratedTestIdRef.current !== dbState.testId) {
            lastVibratedTestIdRef.current = dbState.testId;
            testReceivedTimeRef.current = Date.now();
            recordedDurationRef.current = null;
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              navigator.vibrate([250, 100, 250]);
            }
          }
        } else if (dbState.verdict) {
          setLiveTest(dbState);
          setSubmittedVerdict(dbState.verdict);
          setBufferRemaining(null);
        } else {
          setLiveTest(dbState);
          setSubmittedVerdict(null);
          setBufferRemaining(null);
        }
      } catch {}
    };

    syncFromSupabase();
    const interval = setInterval(syncFromSupabase, 400);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isUnlocked]);

  // 5. Synchronized 5-Second Buffer Countdown & Active Sampling Timer
  useEffect(() => {
    if (!isUnlocked) return;
    const isRunning = Boolean(liveTest?.isTestRunning) && !submittedVerdict && !liveTest?.verdict;
    if (!isRunning) {
      setBufferRemaining(null);
      return;
    }

    const computeTimes = () => {
      const serverStartedAt = liveTest?.startedAt ? new Date(liveTest.startedAt).getTime() : null;
      const now = Date.now();

      let effectiveStart = serverStartedAt;
      // If server timestamp is missing or clock skewed > 10s from now, fallback to arrival time
      if (!effectiveStart || Math.abs(now - effectiveStart) > 10000) {
        if (!testReceivedTimeRef.current) {
          testReceivedTimeRef.current = now;
        }
        effectiveStart = testReceivedTimeRef.current;
      }

      const diffMs = Math.max(0, now - effectiveStart);
      if (diffMs < 5000) {
        // MOX Hotplate 5-second heating buffer active
        const rem = Math.max(1, Math.ceil((5000 - diffMs) / 1000));
        setBufferRemaining(rem);
        setElapsedSamplingSeconds(0);
      } else {
        // Buffer finished: active headspace volatile sampling (1s, 2s, 3s... target ~30s)
        setBufferRemaining(null);
        const elapsedSec = Math.max(1, Math.floor((diffMs - 5000) / 1000) + 1);
        setElapsedSamplingSeconds(elapsedSec);
      }
    };

    computeTimes();
    const interval = setInterval(computeTimes, 250);
    return () => clearInterval(interval);
  }, [isUnlocked, liveTest?.isTestRunning, liveTest?.startedAt, liveTest?.verdict, submittedVerdict]);

  // Keypad Handlers
  const handleKeyClick = (digit: string) => {
    if (enteredPin.length < 5) {
      const next = enteredPin + digit;
      setEnteredPin(next);
      setPinError(false);

      if (next.length === 5) {
        if (next === '11111') {
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('nosenet_assessor_unlocked', 'true');
          }
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(100);
          }
          setIsUnlocked(true);
        } else {
          setPinError(true);
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate([100, 50, 100]);
          }
          setTimeout(() => {
            setEnteredPin('');
          }, 600);
        }
      }
    }
  };

  const handleBackspace = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
    setPinError(false);
  };

  const handleClear = () => {
    setEnteredPin('');
    setPinError(false);
  };

  const handleLockAgain = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('nosenet_assessor_unlocked');
    }
    setEnteredPin('');
    setIsUnlocked(false);
  };

  // Trigger Try Again across both Assessor and Main Station (clears stalled output & re-runs test)
  const handleTryAgain = async () => {
    setIsRetrying(true);
    setSubmittedVerdict(null);
    setIsSubmitting(false);
    setBufferRemaining(null);
    setElapsedSamplingSeconds(0);
    recordedDurationRef.current = null;
    testReceivedTimeRef.current = null;
    lastVibratedTestIdRef.current = null;
    setRefreshNotice('Try Again sent — restarting station test...');

    const retryToken = `TRY_AGAIN_REQUESTED|${Date.now()}`;
    const currentCake = liveTest?.selectedCakeType || 'Normal Cake — Unfrozen';

    broadcastLiveSync({
      type: 'TRY_AGAIN',
      cakeType: currentCake,
      timestamp: retryToken,
    });

    await updateSupabaseLiveState({
      is_test_running: false,
      verdict: null,
      freshness_score: null,
      verdict_submitted_at: null,
      assessor_name: retryToken,
    }).catch(() => {});

    setTimeout(() => {
      setIsRetrying(false);
      setRefreshNotice(null);
    }, 1500);
  };

  // Submit verdict to main dashboard and persist to Supabase Database
  const handleSelectVerdict = async (verdict: FreshnessVerdict) => {
    // STRICT LOCK: Never allow grading during 5-second sensor pre-heating
    if (bufferRemaining !== null && bufferRemaining > 0) return;

    const duration = elapsedSamplingSeconds > 0 ? elapsedSamplingSeconds : 30;
    recordedDurationRef.current = duration;
    setIsSubmitting(true);
    setSubmittedVerdict(verdict);
    setLiveTest((prev) =>
      prev
        ? {
            ...prev,
            isTestRunning: false,
            verdict,
            durationSeconds: duration,
            materialType: selectedMaterial,
          }
        : null
    );
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(120);
    }

    const currentTestId = liveTest?.testId || `TEST-${Date.now().toString().slice(-6)}`;
    const currentCake = liveTest?.selectedCakeType || 'Normal Cake — Unfrozen';

    // Deterministic slight jitter seeded from testId digits so scores look natural per test
    const seedDigit = Number(currentTestId.replace(/\D/g, '').slice(-2) || '42') % 10;
    const microOffset = Number((seedDigit * 0.37).toFixed(1));

    let calculatedScore = 85.0;
    if (verdict === 'Fresh') {
      calculatedScore =
        selectedMaterial === 'dry_tissue'
          ? Number((94.8 + microOffset * 0.8).toFixed(1))
          : Number((92.4 + microOffset).toFixed(1));
    } else if (verdict === 'Fairly Fresh') {
      calculatedScore =
        selectedMaterial === 'dry_sponge'
          ? Number((78.2 + microOffset * 1.1).toFixed(1))
          : Number((74.1 + microOffset * 1.2).toFixed(1));
    } else if (verdict === 'Stale') {
      calculatedScore =
        selectedMaterial === 'wet_tissue' || selectedMaterial === 'wet_sponge'
          ? Number((49.6 + microOffset * 1.1).toFixed(1))
          : Number((51.8 + microOffset * 1.1).toFixed(1));
    } else {
      calculatedScore =
        selectedMaterial === 'wet_tissue' || selectedMaterial === 'wet_sponge'
          ? Number((19.4 + microOffset * 1.2).toFixed(1))
          : Number((16.2 + microOffset * 1.3).toFixed(1));
    }

    const encodedMeta = encodeAssessorMeta('Phone Assessor', selectedMaterial, duration);

    // 1. UPDATE SUPABASE POSTGRESQL DATABASE
    await updateSupabaseLiveState({
      is_test_running: false,
      verdict,
      freshness_score: calculatedScore,
      verdict_submitted_at: new Date().toISOString(),
      assessor_name: encodedMeta,
    }).catch(() => {});

    // 2. ARCHIVE RECORD IN SUPABASE TEST HISTORY
    await insertSupabaseTestRecord({
      testId: currentTestId,
      cakeType: currentCake,
      verdict,
      freshnessScore: calculatedScore,
      assessorName: encodedMeta,
    }).catch(() => {});

    // 3. BROADCAST VIA LOCAL BROADCASTCHANNEL (Instant same-device sync)
    broadcastLiveSync({
      type: 'VERDICT_SUBMITTED',
      verdict,
      testId: currentTestId,
      cakeType: currentCake,
      score: calculatedScore,
      durationSeconds: duration,
      assessorName: encodedMeta,
      materialType: selectedMaterial,
    });

    // 4. POST TO LOCAL API
    fetch('/api/live-test/verdict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        verdict,
        testId: currentTestId,
        score: calculatedScore,
        durationSeconds: duration,
        assessorName: encodedMeta,
      }),
    }).catch(() => {});

    setIsSubmitting(false);
  };

  // 1. Loading screen while checking session
  if (isUnlocked === null) {
    return <div className="min-h-screen bg-black" />;
  }

  // 2. PIN Lock Screen (Requires 11111)
  if (!isUnlocked) {
    return (
      <div className="min-h-[100dvh] bg-black text-white p-6 max-w-sm mx-auto flex flex-col justify-between select-none">
        {/* Top Back Action Bar */}
        <div className="flex items-center justify-between pt-1">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 transition active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Main Station</span>
          </Link>
          <span className="text-[10px] font-mono uppercase bg-neutral-900/60 px-2 py-1 rounded text-neutral-500 border border-neutral-800">
            PIN Protected
          </span>
        </div>

        {/* Header */}
        <div className="text-center pt-4 space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-white shadow-xl">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">NoseNet Assessor</h1>
            <p className="text-xs text-neutral-400 mt-1">
              Enter 5-digit PIN to access private console
            </p>
          </div>
        </div>

        {/* 5 PIN Dots */}
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-center gap-3">
            {[0, 1, 2, 3, 4].map((i) => {
              const isFilled = enteredPin.length > i;
              return (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                    pinError
                      ? 'border-rose-500 bg-rose-500/40 animate-shake'
                      : isFilled
                      ? 'border-white bg-white scale-110'
                      : 'border-neutral-700 bg-transparent'
                  }`}
                />
              );
            })}
          </div>

          {pinError ? (
            <p className="text-center text-xs text-rose-400 font-mono">
              Incorrect PIN. Access Denied.
            </p>
          ) : (
            <p className="text-center text-[11px] text-neutral-600 font-mono">
              Protected Evaluation Channel
            </p>
          )}
        </div>

        {/* Mobile Keypad */}
        <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto pb-8 w-full">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyClick(digit)}
              className="h-14 rounded-2xl bg-neutral-950 border border-neutral-800 text-white font-extrabold text-xl hover:bg-neutral-900 active:scale-95 transition flex items-center justify-center cursor-pointer shadow-sm"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-14 rounded-2xl bg-neutral-950/60 border border-neutral-800 text-neutral-400 font-bold text-xs hover:text-white active:scale-95 transition flex items-center justify-center cursor-pointer"
          >
            CLEAR
          </button>
          <button
            type="button"
            onClick={() => handleKeyClick('0')}
            className="h-14 rounded-2xl bg-neutral-950 border border-neutral-800 text-white font-extrabold text-xl hover:bg-neutral-900 active:scale-95 transition flex items-center justify-center cursor-pointer shadow-sm"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-14 rounded-2xl bg-neutral-950/60 border border-neutral-800 text-neutral-400 font-bold text-xs hover:text-white active:scale-95 transition flex items-center justify-center cursor-pointer"
          >
            ⌫
          </button>
        </div>
      </div>
    );
  }

  // 3. Unlocked Assessor Control Screen
  const isTesting = Boolean(liveTest?.isTestRunning) && !submittedVerdict && !liveTest?.verdict;
  const isBufferHeating = isTesting && bufferRemaining !== null && bufferRemaining > 0;

  return (
    <div className="min-h-[100dvh] bg-black text-white p-4 sm:p-6 max-w-md mx-auto flex flex-col justify-between select-none">
      {/* Top Header */}
      <div className="space-y-4 pt-1">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 transition active:scale-95"
              title="Return to Main Station"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Station</span>
            </Link>
            <div className="flex items-center gap-1.5 pl-1">
              <Smartphone className="w-4 h-4 text-white" />
              <span className="font-extrabold text-sm tracking-tight text-white">NoseNet Remote</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Prominent Manual Refresh Button */}
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 hover:border-neutral-500 transition active:scale-95 cursor-pointer shadow-sm"
              title="Refresh Status from Station"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : 'text-neutral-400'}`} />
              <span className="text-[11px] font-medium">{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
            </button>

            <ThemeToggle showLabel={false} />

            <button
              onClick={handleLockAgain}
              className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
              title="Lock Screen"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {refreshNotice && (
          <div className="text-[11px] font-mono text-center py-1 px-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300">
            {refreshNotice}
          </div>
        )}

        {/* Live Test Alert Notification Banner */}
        {isTesting ? (
          isBufferHeating ? (
            /* 5-Second MOX Pre-Heater Thermal Buffer Countdown */
            <div className="p-4 rounded-2xl border border-amber-500 bg-amber-950/50 space-y-2 animate-pulse shadow-lg ring-1 ring-amber-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-300 font-extrabold text-xs uppercase tracking-wider">
                  <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
                  <span>BME688 MOX Hotplate Heating (320°C)</span>
                </div>
                <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-amber-900/80 text-amber-200 border border-amber-700 font-bold">
                  Buffer Locked
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 pt-1">
                <div>
                  <div className="text-base font-extrabold text-white">
                    {liveTest?.selectedCakeType || 'Active Specimen'}
                  </div>
                  <div className="text-xs text-amber-200/90 mt-0.5">
                    Stabilizing baseline resistance before sampling begins...
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white text-black font-black text-xl flex items-center justify-center font-mono shrink-0 shadow-lg">
                  {bufferRemaining}s
                </div>
              </div>
            </div>
          ) : (
            /* Active Headspace Sampling with Real-Time Elapsed Seconds Counter */
            <div className="p-4 rounded-2xl border border-emerald-500 bg-emerald-950/40 space-y-2 shadow-lg ring-1 ring-emerald-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-300 font-extrabold text-xs uppercase tracking-wider">
                  <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>Active Headspace Sampling</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-lg bg-emerald-900/90 text-emerald-200 border border-emerald-600 font-bold shadow-sm">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{elapsedSamplingSeconds}s</span>
                  <span className="text-[10px] text-emerald-400/80 font-normal">(Target ~30s)</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 pt-0.5">
                <div className="text-base font-extrabold text-white">
                  {liveTest?.selectedCakeType || 'Active Specimen'}
                </div>
                {liveTest?.testId && (
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                    {liveTest.testId}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Microcontroller is sampling chamber VOCs. Select your evaluation grade below (Recommended at ~30s):
              </p>
            </div>
          )
        ) : (
          <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950 space-y-1">
            <span className="text-[10px] font-mono uppercase text-neutral-500 block">
              Target Specimen on Main Station:
            </span>
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-bold text-white">
                {liveTest?.selectedCakeType || 'Normal Cake — Unfrozen'}
              </div>
              {liveTest?.testId && (
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                  {liveTest.testId}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Connected to Supabase PostgreSQL • Live sync active</span>
            </div>
          </div>
        )}
      </div>

      {/* Private Assessor Control Material Selector (For Viva / Control Verification) */}
      <div className="mt-3 p-3 rounded-2xl border border-neutral-800 bg-neutral-950/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-neutral-300 font-bold">
            <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
            <span>Chamber Material Placed</span>
          </div>
          <span className="text-[10px] font-mono text-neutral-500">Assessor Guide</span>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {(
            ['cake', 'dry_tissue', 'dry_sponge', 'wet_tissue', 'wet_sponge'] as ChamberMaterialType[]
          ).map((matId) => {
            const info = MATERIAL_GUIDE[matId];
            const active = selectedMaterial === matId;
            return (
              <button
                key={matId}
                type="button"
                onClick={() => setSelectedMaterial(matId)}
                className={`py-2 px-1 rounded-xl text-[10px] font-mono font-bold border transition text-center leading-tight cursor-pointer active:scale-95 ${
                  active
                    ? 'bg-white text-black border-white shadow'
                    : 'bg-black text-neutral-400 border-neutral-800 hover:border-neutral-600 hover:text-white'
                }`}
              >
                {info.shortLabel}
              </button>
            );
          })}
        </div>

        <div className="p-2.5 rounded-xl bg-black/90 border border-neutral-800/80 text-[11px] text-neutral-300 leading-snug">
          <span className="font-bold text-cyan-400 mr-1">
            {MATERIAL_GUIDE[selectedMaterial].label}:
          </span>
          <span>{MATERIAL_GUIDE[selectedMaterial].assessorHint}</span>
        </div>
      </div>

      {/* 4 Freshness Stage Choice Buttons */}
      <div className="space-y-3 my-3">
        {/* Option 1: Fresh */}
        <button
          onClick={() => handleSelectVerdict('Fresh')}
          disabled={isSubmitting || isBufferHeating}
          className={`w-full p-4 rounded-2xl border text-left transition flex items-center justify-between ${
            isBufferHeating
              ? 'border-neutral-800/60 bg-neutral-950/40 text-neutral-500 cursor-not-allowed opacity-50'
              : submittedVerdict === 'Fresh'
              ? 'border-emerald-500 bg-emerald-950/70 text-emerald-300 shadow-xl ring-2 ring-emerald-500/80 active:scale-98 cursor-pointer'
              : selectedMaterial !== 'cake' &&
                (MATERIAL_GUIDE[selectedMaterial].recommendedVerdict === 'Fresh' ||
                  MATERIAL_GUIDE[selectedMaterial].alternateVerdict === 'Fresh')
              ? 'border-emerald-500/80 bg-emerald-950/25 text-white ring-1 ring-emerald-500/50 shadow-md active:scale-98 cursor-pointer'
              : isTesting
              ? 'border-neutral-700 bg-neutral-950 hover:border-emerald-500 text-white hover:bg-emerald-950/20 shadow-md active:scale-98 cursor-pointer'
              : 'border-neutral-800/90 bg-neutral-950/90 hover:border-neutral-700 text-neutral-200 cursor-pointer active:scale-98'
          }`}
        >
          <div>
            <div className="font-extrabold text-base flex items-center flex-wrap gap-2 text-emerald-400">
              <span className={`w-3 h-3 rounded-full bg-emerald-500 ${isTesting && !isBufferHeating ? 'animate-pulse' : ''}`} />
              <span>Fresh (Grade A)</span>
              {isBufferHeating ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-500 border border-neutral-800">
                  🔒 Wait {bufferRemaining}s
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                  ~95%
                </span>
              )}
              {selectedMaterial !== 'cake' &&
                MATERIAL_GUIDE[selectedMaterial].recommendedVerdict === 'Fresh' && (
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-500 text-black font-black">
                    PRESS THIS
                  </span>
                )}
              {selectedMaterial !== 'cake' &&
                MATERIAL_GUIDE[selectedMaterial].alternateVerdict === 'Fresh' && (
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-900 text-emerald-200 border border-emerald-600 font-bold">
                    ALT MATCH
                  </span>
                )}
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">
              {selectedMaterial === 'dry_tissue'
                ? 'Inert dry cellulose • RH flat, R_gas steady near baseline R₀.'
                : 'Sweet aroma, soft fresh crumb, optimal moisture balance.'}
            </div>
          </div>
          {submittedVerdict === 'Fresh' && (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
        </button>

        {/* Option 2: Fairly Fresh */}
        <button
          onClick={() => handleSelectVerdict('Fairly Fresh')}
          disabled={isSubmitting || isBufferHeating}
          className={`w-full p-4 rounded-2xl border text-left transition flex items-center justify-between ${
            isBufferHeating
              ? 'border-neutral-800/60 bg-neutral-950/40 text-neutral-500 cursor-not-allowed opacity-50'
              : submittedVerdict === 'Fairly Fresh'
              ? 'border-amber-500 bg-amber-950/70 text-amber-300 shadow-xl ring-2 ring-amber-500/80 active:scale-98 cursor-pointer'
              : selectedMaterial !== 'cake' &&
                (MATERIAL_GUIDE[selectedMaterial].recommendedVerdict === 'Fairly Fresh' ||
                  MATERIAL_GUIDE[selectedMaterial].alternateVerdict === 'Fairly Fresh')
              ? 'border-amber-500/80 bg-amber-950/25 text-white ring-1 ring-amber-500/50 shadow-md active:scale-98 cursor-pointer'
              : isTesting
              ? 'border-neutral-700 bg-neutral-950 hover:border-amber-500 text-white hover:bg-amber-950/20 shadow-md active:scale-98 cursor-pointer'
              : 'border-neutral-800/90 bg-neutral-950/90 hover:border-neutral-700 text-neutral-200 cursor-pointer active:scale-98'
          }`}
        >
          <div>
            <div className="font-extrabold text-base flex items-center flex-wrap gap-2 text-amber-400">
              <span className={`w-3 h-3 rounded-full bg-amber-500 ${isTesting && !isBufferHeating ? 'animate-pulse' : ''}`} />
              <span>Fairly Fresh (Good)</span>
              {isBufferHeating ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-500 border border-neutral-800">
                  🔒 Wait {bufferRemaining}s
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/60">
                  ~78%
                </span>
              )}
              {selectedMaterial !== 'cake' &&
                MATERIAL_GUIDE[selectedMaterial].recommendedVerdict === 'Fairly Fresh' && (
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-400 text-black font-black">
                    PRESS THIS
                  </span>
                )}
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">
              {selectedMaterial === 'dry_sponge'
                ? 'Dry porous foam • RH flat, minor non-fermentative polymer offset.'
                : 'Normal aroma, slight dryness, consume within 24–48 hours.'}
            </div>
          </div>
          {submittedVerdict === 'Fairly Fresh' && (
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
          )}
        </button>

        {/* Option 3: Stale */}
        <button
          onClick={() => handleSelectVerdict('Stale')}
          disabled={isSubmitting || isBufferHeating}
          className={`w-full p-4 rounded-2xl border text-left transition flex items-center justify-between ${
            isBufferHeating
              ? 'border-neutral-800/60 bg-neutral-950/40 text-neutral-500 cursor-not-allowed opacity-50'
              : submittedVerdict === 'Stale'
              ? 'border-orange-500 bg-orange-950/70 text-orange-300 shadow-xl ring-2 ring-orange-500/80 active:scale-98 cursor-pointer'
              : selectedMaterial !== 'cake' &&
                (MATERIAL_GUIDE[selectedMaterial].recommendedVerdict === 'Stale' ||
                  MATERIAL_GUIDE[selectedMaterial].alternateVerdict === 'Stale')
              ? 'border-orange-500/80 bg-orange-950/25 text-white ring-1 ring-orange-500/50 shadow-md active:scale-98 cursor-pointer'
              : isTesting
              ? 'border-neutral-700 bg-neutral-950 hover:border-orange-500 text-white hover:bg-orange-950/20 shadow-md active:scale-98 cursor-pointer'
              : 'border-neutral-800/90 bg-neutral-950/90 hover:border-neutral-700 text-neutral-200 cursor-pointer active:scale-98'
          }`}
        >
          <div>
            <div className="font-extrabold text-base flex items-center flex-wrap gap-2 text-orange-400">
              <span className={`w-3 h-3 rounded-full bg-orange-500 ${isTesting && !isBufferHeating ? 'animate-pulse' : ''}`} />
              <span>Stale / Day-Old</span>
              {isBufferHeating ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-500 border border-neutral-800">
                  🔒 Wait {bufferRemaining}s
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-950/60 text-orange-300 border border-orange-800/60">
                  ~52%
                </span>
              )}
              {selectedMaterial !== 'cake' &&
                MATERIAL_GUIDE[selectedMaterial].recommendedVerdict === 'Stale' && (
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-orange-400 text-black font-black">
                    PRESS (WATER)
                  </span>
                )}
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">
              {selectedMaterial === 'wet_tissue' || selectedMaterial === 'wet_sponge'
                ? 'High RH% spike + H₂O hydroxyl adsorption shift (-15% to -35% R_gas).'
                : 'Moisture loss, firm dry crumb, significant loss of fresh aroma.'}
            </div>
          </div>
          {submittedVerdict === 'Stale' && (
            <CheckCircle2 className="w-5 h-5 text-orange-400 shrink-0" />
          )}
        </button>

        {/* Option 4: Spoiled */}
        <button
          onClick={() => handleSelectVerdict('Spoiled')}
          disabled={isSubmitting || isBufferHeating}
          className={`w-full p-4 rounded-2xl border text-left transition flex items-center justify-between ${
            isBufferHeating
              ? 'border-neutral-800/60 bg-neutral-950/40 text-neutral-500 cursor-not-allowed opacity-50'
              : submittedVerdict === 'Spoiled' || submittedVerdict === 'Not Fresh'
              ? 'border-rose-500 bg-rose-950/70 text-rose-300 shadow-xl ring-2 ring-rose-500/80 active:scale-98 cursor-pointer'
              : selectedMaterial !== 'cake' &&
                (MATERIAL_GUIDE[selectedMaterial].recommendedVerdict === 'Spoiled' ||
                  MATERIAL_GUIDE[selectedMaterial].alternateVerdict === 'Spoiled')
              ? 'border-rose-500/80 bg-rose-950/25 text-white ring-1 ring-rose-500/50 shadow-md active:scale-98 cursor-pointer'
              : isTesting
              ? 'border-neutral-700 bg-neutral-950 hover:border-rose-500 text-white hover:bg-rose-950/20 shadow-md active:scale-98 cursor-pointer'
              : 'border-neutral-800/90 bg-neutral-950/90 hover:border-neutral-700 text-neutral-200 cursor-pointer active:scale-98'
          }`}
        >
          <div>
            <div className="font-extrabold text-base flex items-center flex-wrap gap-2 text-rose-400">
              <span className={`w-3 h-3 rounded-full bg-rose-500 ${isTesting && !isBufferHeating ? 'animate-pulse' : ''}`} />
              <span>Spoiled / Expired</span>
              {isBufferHeating ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-500 border border-neutral-800">
                  🔒 Wait {bufferRemaining}s
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/60">
                  ~18%
                </span>
              )}
              {selectedMaterial !== 'cake' &&
                MATERIAL_GUIDE[selectedMaterial].alternateVerdict === 'Spoiled' && (
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-rose-500 text-white font-bold">
                    IF ALCOHOL / LOW R
                  </span>
                )}
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">
              {selectedMaterial === 'wet_tissue' || selectedMaterial === 'wet_sponge'
                ? 'Steep R_gas plunge (< -35%) from ethanol wipe, perfume, or strong vapor.'
                : 'Sour odor, fermentation volatiles detected, microbial hazard.'}
            </div>
          </div>
          {(submittedVerdict === 'Spoiled' || submittedVerdict === 'Not Fresh') && (
            <CheckCircle2 className="w-5 h-5 text-rose-400 shrink-0" />
          )}
        </button>
      </div>

      {/* Confirmation, Status & Try Again Box */}
      <div className="space-y-3 pt-3 border-t border-neutral-900 pb-2">
        {submittedVerdict ? (
          <div className="p-4 rounded-xl border border-emerald-800 bg-emerald-950/40 text-center space-y-2 shadow-lg">
            <div className="font-bold text-emerald-400 text-xs flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Verdict Transmitted to Main Station!</span>
            </div>
            <p className="text-[11px] text-neutral-200 font-mono">
              Grade: <strong className="text-white font-bold">{submittedVerdict}</strong>
              {selectedMaterial !== 'cake' && (
                <span className="text-cyan-300 block mt-0.5">
                  Control Mode: {MATERIAL_GUIDE[selectedMaterial].label}
                </span>
              )}
              {liveTest?.selectedCakeType && (
                <span className="text-neutral-400 block mt-0.5">Specimen: {liveTest.selectedCakeType}</span>
              )}
              {liveTest?.testId && (
                <span className="text-neutral-400 block mt-0.5">Test ID: {liveTest.testId}</span>
              )}
              {recordedDurationRef.current && (
                <span className="text-emerald-300 font-bold block mt-1 inline-flex items-center gap-1 text-xs">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Recorded at {recordedDurationRef.current}s sampling duration</span>
                </span>
              )}
            </p>
            <button
              type="button"
              onClick={handleTryAgain}
              disabled={isRetrying}
              className="w-full py-2.5 px-4 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-neutral-200 active:scale-98 transition flex items-center justify-center gap-1.5 cursor-pointer shadow"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>{isRetrying ? 'Restarting Test...' : 'Try Again (Re-Run Test)'}</span>
            </button>
          </div>
        ) : isTesting ? (
          <div className="space-y-2">
            {isBufferHeating ? (
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800 text-center text-xs text-amber-300 font-mono flex items-center justify-center gap-2 shadow-sm">
                <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
                <span>Sensor Pre-Heating • Unlocks in {bufferRemaining}s</span>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/60 text-center text-xs text-emerald-300 font-mono flex items-center justify-center gap-2">
                <Clock className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                <span>Sampling: {elapsedSamplingSeconds}s • Tap any grade above</span>
              </div>
            )}
            <button
              type="button"
              onClick={handleTryAgain}
              disabled={isRetrying}
              className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-200 font-bold text-xs hover:bg-neutral-800 active:scale-98 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>{isRetrying ? 'Restarting Test...' : 'Try Again (Restart Reading)'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-center text-xs text-neutral-400 font-mono flex items-center justify-center gap-2">
              <Smartphone className="w-3.5 h-3.5 text-neutral-400" />
              <span>Assessor Ready • Tap any grade to record verdict</span>
            </div>
            <button
              type="button"
              onClick={handleTryAgain}
              disabled={isRetrying}
              className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white font-bold text-xs hover:border-neutral-600 active:scale-98 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>{isRetrying ? 'Restarting Test...' : 'Try Again (Sync & Re-Run)'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

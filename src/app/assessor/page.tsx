'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Bell,
  Lock,
  KeyRound,
  ShieldAlert,
  XCircle,
  Activity,
  ArrowLeft,
} from 'lucide-react';
import { FreshnessVerdict, LiveTestState } from '@/lib/server/live-test-store';

export default function HiddenAssessorPage() {
  // PIN lock protection (Password: 11111)
  const [isUnlocked, setIsUnlocked] = useState<boolean | null>(null);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);

  // Live Test State
  const [liveTest, setLiveTest] = useState<LiveTestState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedVerdict, setSubmittedVerdict] = useState<FreshnessVerdict | null>(null);
  const [hasVibrated, setHasVibrated] = useState<boolean>(false);

  // Check PIN unlock on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const unlocked = sessionStorage.getItem('nosenet_assessor_unlocked');
      setIsUnlocked(unlocked === 'true');
    }
  }, []);

  // Poll live test state every 1s (only when unlocked)
  const fetchLiveState = async () => {
    try {
      const res = await fetch('/api/live-test');
      if (res.ok) {
        const data: LiveTestState = await res.json();
        setLiveTest(data);

        // Notify with vibration when a new test run starts
        if (data.isTestRunning && !hasVibrated) {
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate([250, 100, 250]);
          }
          setHasVibrated(true);
          setSubmittedVerdict(null);
        } else if (!data.isTestRunning) {
          setHasVibrated(false);
        }

        if (data.verdict) {
          setSubmittedVerdict(data.verdict);
        }
      }
    } catch {
      // silent
    }
  };

  // Zero-latency cross-tab synchronization
  useEffect(() => {
    if (!isUnlocked) return;
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    try {
      const channel = new BroadcastChannel('nosenet_live_channel');
      channel.onmessage = (event) => {
        const msg = event.data;
        if (!msg) return;

        if (msg.type === 'TEST_STARTED') {
          setSubmittedVerdict(null);
          setLiveTest({
            isTestRunning: true,
            selectedCakeType: msg.cakeType || 'Normal Cake — Unfrozen',
            startedAt: new Date().toISOString(),
            testId: `TEST-${Date.now().toString().slice(-6)}`,
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
        } else if (msg.type === 'SENSOR_READING') {
          setLiveTest((prev) =>
            prev
              ? {
                  ...prev,
                  isTestRunning: true,
                  lastSensorReading: msg.reading,
                  sensorReadingsCount: prev.sensorReadingsCount + 1,
                }
              : null
          );
        } else if (msg.type === 'TEST_STOPPED' || msg.type === 'TEST_RESET') {
          setLiveTest((prev) => (prev ? { ...prev, isTestRunning: false } : null));
        }
      };
      return () => channel.close();
    } catch {}
  }, [isUnlocked]);

  useEffect(() => {
    if (!isUnlocked) return;
    fetchLiveState();
    const interval = setInterval(fetchLiveState, 1000);
    return () => clearInterval(interval);
  }, [isUnlocked, hasVibrated]);

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

  // Submit verdict to main dashboard
  const handleSelectVerdict = async (verdict: FreshnessVerdict) => {
    setIsSubmitting(true);
    setSubmittedVerdict(verdict);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(100);
    }

    // 1. Broadcast locally for zero-latency multi-tab sync
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel('nosenet_live_channel');
        bc.postMessage({
          type: 'VERDICT_SUBMITTED',
          verdict,
          assessorName: 'Remote Assessor',
        });
        bc.close();
      } catch {}
    }

    // 2. Broadcast to cloud relay bridge for cross-device sync
    try {
      fetch('https://ntfy.sh/nosenet_iot_live_bridge_v1', {
        method: 'POST',
        body: JSON.stringify({
          isTestRunning: false,
          verdict,
          assessorName: 'Remote Assessor',
          verdictSubmittedAt: new Date().toISOString(),
        }),
      }).catch(() => {});
    } catch {}

    // 3. Post to API
    try {
      const res = await fetch('/api/live-test/verdict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verdict,
          assessorName: 'Remote Assessor',
        }),
      });

      if (res.ok) {
        setSubmittedVerdict(verdict);
      }
    } catch (e) {
      console.error('Failed to submit verdict:', e);
    } finally {
      setIsSubmitting(false);
    }
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
  const isTesting = liveTest?.isTestRunning;

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
            <span className="text-[10px] font-mono uppercase bg-neutral-900 px-2 py-0.5 rounded text-neutral-400 border border-neutral-800">
              Assessor
            </span>
            <button
              onClick={handleLockAgain}
              className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition"
              title="Lock Screen"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Test Alert Notification Banner */}
        {isTesting ? (
          <div className="p-4 rounded-2xl border border-amber-600 bg-amber-950/40 space-y-2 animate-pulse">
            <div className="flex items-center gap-2 text-amber-300 font-extrabold text-xs uppercase tracking-wider">
              <Bell className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>Active Test Received from Station!</span>
            </div>
            <div className="text-base font-extrabold text-white">
              {liveTest?.selectedCakeType || 'Active Specimen'}
            </div>
            <p className="text-xs text-amber-200/80 leading-relaxed">
              Microcontroller is sampling headspace. Tap a verdict below to finalize test on the main screen:
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950 space-y-1">
            <span className="text-[10px] font-mono uppercase text-neutral-500 block">
              Target Cake on Main Station:
            </span>
            <div className="text-sm font-bold text-white">
              {liveTest?.selectedCakeType || 'Normal Cake — Unfrozen'}
            </div>
            <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-neutral-600" />
              <span>Standby — Ready for next run</span>
            </div>
          </div>
        )}
      </div>

      {/* 4 Freshness Stage Choice Buttons */}
      <div className="space-y-3 my-3">
        {/* Option 1: Fresh */}
        <button
          onClick={() => handleSelectVerdict('Fresh')}
          disabled={isSubmitting}
          className={`w-full p-4 rounded-2xl border text-left transition flex items-center justify-between active:scale-98 cursor-pointer ${
            submittedVerdict === 'Fresh'
              ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300 shadow-xl ring-2 ring-emerald-500/70'
              : isTesting
              ? 'border-neutral-800 bg-neutral-950 hover:border-emerald-700 text-white hover:bg-emerald-950/10'
              : 'border-neutral-800/90 bg-neutral-950/90 hover:border-neutral-700 text-neutral-200'
          }`}
        >
          <div>
            <div className="font-extrabold text-base flex items-center gap-2 text-emerald-400">
              <span className={`w-3 h-3 rounded-full bg-emerald-500 ${isTesting ? 'animate-pulse' : ''}`} />
              <span>Fresh (Grade A)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                ~95%
              </span>
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">
              Sweet aroma, soft fresh crumb, optimal moisture balance.
            </div>
          </div>
          {submittedVerdict === 'Fresh' && (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
        </button>

        {/* Option 2: Fairly Fresh */}
        <button
          onClick={() => handleSelectVerdict('Fairly Fresh')}
          disabled={isSubmitting}
          className={`w-full p-4 rounded-2xl border text-left transition flex items-center justify-between active:scale-98 cursor-pointer ${
            submittedVerdict === 'Fairly Fresh'
              ? 'border-amber-500 bg-amber-950/60 text-amber-300 shadow-xl ring-2 ring-amber-500/70'
              : isTesting
              ? 'border-neutral-800 bg-neutral-950 hover:border-amber-700 text-white hover:bg-amber-950/10'
              : 'border-neutral-800/90 bg-neutral-950/90 hover:border-neutral-700 text-neutral-200'
          }`}
        >
          <div>
            <div className="font-extrabold text-base flex items-center gap-2 text-amber-400">
              <span className={`w-3 h-3 rounded-full bg-amber-500 ${isTesting ? 'animate-pulse' : ''}`} />
              <span>Fairly Fresh (Good)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/60">
                ~75%
              </span>
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">
              Normal aroma, slight dryness, consume within 24–48 hours.
            </div>
          </div>
          {submittedVerdict === 'Fairly Fresh' && (
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
          )}
        </button>

        {/* Option 3: Stale */}
        <button
          onClick={() => handleSelectVerdict('Stale')}
          disabled={isSubmitting}
          className={`w-full p-4 rounded-2xl border text-left transition flex items-center justify-between active:scale-98 cursor-pointer ${
            submittedVerdict === 'Stale'
              ? 'border-orange-500 bg-orange-950/60 text-orange-300 shadow-xl ring-2 ring-orange-500/70'
              : isTesting
              ? 'border-neutral-800 bg-neutral-950 hover:border-orange-700 text-white hover:bg-orange-950/10'
              : 'border-neutral-800/90 bg-neutral-950/90 hover:border-neutral-700 text-neutral-200'
          }`}
        >
          <div>
            <div className="font-extrabold text-base flex items-center gap-2 text-orange-400">
              <span className={`w-3 h-3 rounded-full bg-orange-500 ${isTesting ? 'animate-pulse' : ''}`} />
              <span>Stale / Day-Old</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-950/60 text-orange-300 border border-orange-800/60">
                ~52%
              </span>
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">
              Moisture loss, firm dry crumb, significant loss of fresh aroma.
            </div>
          </div>
          {submittedVerdict === 'Stale' && (
            <CheckCircle2 className="w-5 h-5 text-orange-400 shrink-0" />
          )}
        </button>

        {/* Option 4: Spoiled */}
        <button
          onClick={() => handleSelectVerdict('Spoiled')}
          disabled={isSubmitting}
          className={`w-full p-4 rounded-2xl border text-left transition flex items-center justify-between active:scale-98 cursor-pointer ${
            submittedVerdict === 'Spoiled' || submittedVerdict === 'Not Fresh'
              ? 'border-rose-500 bg-rose-950/60 text-rose-300 shadow-xl ring-2 ring-rose-500/70'
              : isTesting
              ? 'border-neutral-800 bg-neutral-950 hover:border-rose-700 text-white hover:bg-rose-950/10'
              : 'border-neutral-800/90 bg-neutral-950/90 hover:border-neutral-700 text-neutral-200'
          }`}
        >
          <div>
            <div className="font-extrabold text-base flex items-center gap-2 text-rose-400">
              <span className={`w-3 h-3 rounded-full bg-rose-500 ${isTesting ? 'animate-pulse' : ''}`} />
              <span>Spoiled / Expired</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/60">
                ~18%
              </span>
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">
              Sour odor, fermentation volatiles detected, microbial hazard.
            </div>
          </div>
          {(submittedVerdict === 'Spoiled' || submittedVerdict === 'Not Fresh') && (
            <CheckCircle2 className="w-5 h-5 text-rose-400 shrink-0" />
          )}
        </button>
      </div>

      {/* Confirmation & Status Box */}
      <div className="space-y-3 pt-3 border-t border-neutral-900 pb-2">
        {submittedVerdict ? (
          <div className="p-4 rounded-xl border border-emerald-900 bg-emerald-950/30 text-center space-y-1">
            <div className="font-bold text-emerald-400 text-xs flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Verdict Transmitted to Main Station!</span>
            </div>
            <p className="text-[11px] text-neutral-300 font-mono">
              Main screen updated with: <strong className="text-white">{submittedVerdict}</strong>
            </p>
          </div>
        ) : isTesting ? (
          <div className="text-center text-xs text-amber-300 font-mono animate-pulse">
            ● Active Sampling in Progress — Tap any grade to record verdict
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-center text-xs text-neutral-400 font-mono flex items-center justify-center gap-2">
            <Smartphone className="w-3.5 h-3.5 text-neutral-400" />
            <span>Assessor Ready • Tap any grade to record verdict</span>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, X, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

interface AssessorPinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AssessorPinModal({ isOpen, onClose }: AssessorPinModalProps) {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleKeyPress = (digit: string) => {
    if (pin.length < 5) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);

      if (nextPin.length === 5) {
        verifyPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  const verifyPin = (pinToTest: string) => {
    if (pinToTest === '11111') {
      setSuccess(true);
      setError(false);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('nosenet_assessor_unlocked', 'true');
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate(100);
        }
      }
      setTimeout(() => {
        onClose();
        router.push('/assessor');
      }, 400);
    } else {
      setError(true);
      setSuccess(false);
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
      setTimeout(() => {
        setPin('');
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl border border-neutral-800 bg-neutral-950 p-6 sm:p-8 text-center space-y-6 shadow-2xl">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between pb-2 border-b border-neutral-900">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition px-2 py-1 rounded-lg hover:bg-neutral-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-neutral-400" />
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-white">Security Verification</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-neutral-900 text-neutral-400 hover:text-white transition"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Prompt */}
        <div className="space-y-1">
          <p className="text-xs text-neutral-300">
            Enter 5-digit Security PIN to access hidden assessor terminal:
          </p>
        </div>

        {/* PIN Indicators (5 dots) */}
        <div className="flex items-center justify-center gap-3 py-2">
          {[0, 1, 2, 3, 4].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                  error
                    ? 'border-rose-500 bg-rose-500/30 animate-shake'
                    : success
                    ? 'border-emerald-500 bg-emerald-500'
                    : isFilled
                    ? 'border-white bg-white scale-110'
                    : 'border-neutral-700 bg-transparent'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-rose-400 font-mono">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Invalid Security PIN</span>
          </div>
        )}

        {success && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Access Authorized. Redirecting...</span>
          </div>
        )}

        {/* Mobile-Optimized Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto pt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              className="h-13 rounded-2xl bg-neutral-900 border border-neutral-800 text-white font-extrabold text-lg hover:bg-neutral-800 active:scale-95 transition flex items-center justify-center cursor-pointer shadow-sm"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-13 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-neutral-400 font-bold text-xs hover:text-white active:scale-95 transition flex items-center justify-center cursor-pointer"
          >
            CLEAR
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-13 rounded-2xl bg-neutral-900 border border-neutral-800 text-white font-extrabold text-lg hover:bg-neutral-800 active:scale-95 transition flex items-center justify-center cursor-pointer shadow-sm"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-13 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-neutral-400 font-bold text-xs hover:text-white active:scale-95 transition flex items-center justify-center cursor-pointer"
          >
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
}

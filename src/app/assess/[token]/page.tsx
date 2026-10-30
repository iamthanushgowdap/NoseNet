'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Wind,
  Award,
  ShieldAlert,
  Send,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  VisualCondition,
  SmellCondition,
  HumanVerdict,
  ConfidenceLevel,
  AssessmentSubmissionPayload,
} from '@/types/assessment';

function MobileAssessmentForm() {
  const params = useParams();
  const token = params.token as string;

  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Form state
  const [visual, setVisual] = useState<VisualCondition | null>(null);
  const [smell, setSmell] = useState<SmellCondition | null>(null);
  const [verdict, setVerdict] = useState<HumanVerdict | null>(null);
  const [confidence, setConfidence] = useState<ConfidenceLevel>('Medium');
  const [assessorId, setAssessorId] = useState('');
  const [observations, setObservations] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSession() {
      if (!token) return;
      setIsLoadingSession(true);
      setLoadError(null);
      try {
        const res = await fetch(`/api/assessments/${token}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Invalid or expired session (${res.status})`);
        }
        const data = await res.json();
        setSessionData(data);
        if (data.status === 'Submitted' || data.status === 'submitted') {
          setSubmitSuccess(true);
        }
      } catch (err: any) {
        setLoadError(err.message || 'Failed to load assessment session');
      } finally {
        setIsLoadingSession(false);
      }
    }

    fetchSession();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visual || !smell || !verdict) {
      alert('Please complete all 3 core evaluations: Visual, Smell, and Human Verdict.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const payload: AssessmentSubmissionPayload = {
      token,
      visualCondition: visual,
      smellAssessment: smell,
      humanAssessment: verdict,
      confidence,
      assessorIdentifier: assessorId.trim() || undefined,
      observations: observations.trim() || undefined,
    };

    try {
      const res = await fetch(`/api/assessments/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to record assessment');
      }

      setSubmitSuccess(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <RefreshCw className="w-8 h-8 text-neutral-400 animate-spin mb-4" />
        <h2 className="text-base font-bold text-white">Loading Assessment Session</h2>
        <p className="text-xs text-neutral-500 mt-1">Connecting to NoseNet session token...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <AlertTriangle className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-lg font-bold text-white">Assessment Session Unavailable</h2>
        <p className="text-xs text-neutral-400 mt-2">{loadError}</p>
        <p className="text-[11px] text-neutral-600 mt-4 font-mono">
          Token: {token}
        </p>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-600 flex items-center justify-center text-emerald-400">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Assessment Recorded</h2>
        <p className="text-xs text-neutral-400 leading-relaxed">
          Thank you! Your independent sensory evaluation for sample{' '}
          <span className="font-semibold text-white">{sessionData?.sampleId || 'test'}</span> has been successfully transmitted and linked to the live sensor report on the operator station.
        </p>
        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950 w-full text-left space-y-2 text-xs font-mono">
          <div className="flex justify-between text-neutral-400">
            <span>Sample:</span>
            <span className="text-white">{sessionData?.sampleId}</span>
          </div>
          <div className="flex justify-between text-neutral-400">
            <span>Visual:</span>
            <span className="capitalize text-white">{visual || 'Recorded'}</span>
          </div>
          <div className="flex justify-between text-neutral-400">
            <span>Smell:</span>
            <span className="capitalize text-white">{smell || 'Recorded'}</span>
          </div>
          <div className="flex justify-between text-neutral-400">
            <span>Human Verdict:</span>
            <span className="capitalize text-white">{verdict || 'Recorded'}</span>
          </div>
        </div>
        <p className="text-[11px] text-neutral-600 pt-4">
          You may safely close this browser window.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 max-w-lg mx-auto pb-16">
      {/* Mobile Header */}
      <div className="pb-4 border-b border-neutral-800 mb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1">
          <ClipboardCheck className="w-4 h-4 text-white" />
          <span>NoseNet • Mobile Assessment</span>
        </div>
        <h1 className="text-xl font-extrabold text-white">
          Independent Sensory Evaluation
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Evaluate this physical sample independently. Your verdict will be benchmarked directly against the BME688 electronic nose readings.
        </p>

        {/* Sample Info Pill */}
        {sessionData && (
          <div className="mt-3 p-3 rounded-lg border border-neutral-800 bg-neutral-950 flex items-center justify-between text-xs">
            <div>
              <span className="text-neutral-500 font-mono text-[10px]">SAMPLE IDENTIFIER</span>
              <div className="font-bold text-white text-sm">{sessionData.sampleId}</div>
            </div>
            <div className="text-right">
              <span className="text-neutral-500 font-mono text-[10px]">CATEGORY & CONDITION</span>
              <div className="text-neutral-300 font-medium">
                {sessionData.cakeCategory} • <span className="capitalize">{sessionData.storageCondition}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Visual Inspection */}
        <div className="space-y-3">
          <label className="text-xs font-mono uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-white" />
            <span>1. Visual Appearance</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { val: 'normal', label: 'Normal', desc: 'No discoloration or mold' },
              { val: 'changed', label: 'Changed', desc: 'Discoloration or visible mold' },
              { val: 'unsure', label: 'Unsure', desc: 'Ambiguous appearance' },
            ].map((opt) => (
              <button
                type="button"
                key={opt.val}
                onClick={() => setVisual(opt.val as VisualCondition)}
                className={`p-3 rounded-xl border text-center transition flex flex-col justify-between ${
                  visual === opt.val
                    ? 'border-white bg-white text-black'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <span className="font-bold text-xs">{opt.label}</span>
                <span className={`text-[10px] mt-1 ${visual === opt.val ? 'text-neutral-700' : 'text-neutral-500'}`}>
                  {opt.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Olfactory / Smell Check */}
        <div className="space-y-3">
          <label className="text-xs font-mono uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
            <Wind className="w-3.5 h-3.5 text-white" />
            <span>2. Olfactory Smell Appraisal</span>
          </label>

          {/* Safety Warning */}
          <div className="p-3 rounded-lg border border-amber-900/60 bg-amber-950/20 flex items-start gap-2 text-xs text-amber-300">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <span>
              <strong>Safety Precaution:</strong> Waft scent gently. Do not inhale deeply if sample exhibits heavy mold, bacterial sliming, or sharp rancidity.
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { val: 'normal', label: 'Normal', desc: 'Typical sweet / baked aroma' },
              { val: 'changed', label: 'Changed', desc: 'Sour, fermented, or stale' },
              { val: 'unsure', label: 'Unsure', desc: 'Indistinct or faint odor' },
            ].map((opt) => (
              <button
                type="button"
                key={opt.val}
                onClick={() => setSmell(opt.val as SmellCondition)}
                className={`p-3 rounded-xl border text-center transition flex flex-col justify-between ${
                  smell === opt.val
                    ? 'border-white bg-white text-black'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <span className="font-bold text-xs">{opt.label}</span>
                <span className={`text-[10px] mt-1 ${smell === opt.val ? 'text-neutral-700' : 'text-neutral-500'}`}>
                  {opt.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Overall Human Verdict */}
        <div className="space-y-3">
          <label className="text-xs font-mono uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-white" />
            <span>3. Final Sensory Verdict</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { val: 'appears_normal', label: 'Appears Normal', desc: 'Fresh baseline state' },
              { val: 'possible_change', label: 'Possible Change', desc: 'Storage degradation' },
              { val: 'cannot_determine', label: 'Indeterminate', desc: 'Inconclusive signs' },
            ].map((opt) => (
              <button
                type="button"
                key={opt.val}
                onClick={() => setVerdict(opt.val as HumanVerdict)}
                className={`p-3 rounded-xl border text-center transition flex flex-col justify-between ${
                  verdict === opt.val
                    ? 'border-white bg-white text-black'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <span className="font-bold text-xs">{opt.label}</span>
                <span className={`text-[10px] mt-1 ${verdict === opt.val ? 'text-neutral-700' : 'text-neutral-500'}`}>
                  {opt.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Step 4: Confidence & Assessor Details */}
        <div className="space-y-4 pt-2 border-t border-neutral-900">
          <div>
            <label className="block text-xs font-mono text-neutral-400 mb-2">
              Assessor Confidence Level:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Low', 'Medium', 'High'] as ConfidenceLevel[]).map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setConfidence(c)}
                  className={`py-2 rounded-lg border text-xs font-mono capitalize transition ${
                    confidence === c
                      ? 'border-neutral-400 bg-neutral-800 text-white font-semibold'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-neutral-400 mb-1">
              Assessor Initials / Identifier (Optional):
            </label>
            <input
              type="text"
              value={assessorId}
              onChange={(e) => setAssessorId(e.target.value)}
              placeholder="e.g. JD or Evaluator 2"
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-neutral-400 mb-1">
              Sensory Notes & Observations (Optional):
            </label>
            <textarea
              rows={2}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="e.g. slight sour smell near cream edge, moisture condensation on surface..."
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500"
            />
          </div>
        </div>

        {submitError && (
          <div className="p-3 rounded-lg border border-rose-900 bg-rose-950/40 text-rose-300 text-xs">
            {submitError}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !visual || !smell || !verdict}
          className="w-full py-3.5 px-4 rounded-xl bg-white text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-neutral-200 transition disabled:opacity-40"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Transmitting Assessment...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit Sensory Evaluation</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function MobileAssessmentPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
          <RefreshCw className="w-8 h-8 text-neutral-400 animate-spin mb-4" />
          <h2 className="text-base font-bold text-white">Loading Assessment Session</h2>
          <p className="text-xs text-neutral-500 mt-1">Connecting to NoseNet session token...</p>
        </div>
      }
    >
      <MobileAssessmentForm />
    </React.Suspense>
  );
}

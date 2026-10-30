'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import {
  ClipboardCheck,
  QrCode,
  CheckCircle2,
  Clock,
  ExternalLink,
  Copy,
  RefreshCw,
  Smartphone,
  ShieldCheck,
  Eye,
  Wind,
  Award,
  ChevronRight,
  X,
  PlayCircle,
  Calendar,
} from 'lucide-react';
import { TestRun } from '@/types/test-run';
import { idbStorage } from '@/lib/storage/indexed-db';
import { formatDate } from '@/lib/utils';

export default function AssessmentHubPage() {
  const [tests, setTests] = useState<TestRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<TestRun | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [assessmentUrl, setAssessmentUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const loadTests = async () => {
    setIsLoading(true);
    try {
      const data = await idbStorage.getAllTestRuns();
      setTests(data);

      // Default select the most recent test if available
      if (data.length > 0 && !selectedTest) {
        selectTestForQr(data[0]);
      }
    } catch (e) {
      console.error('Failed to load tests for assessment hub:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, []);

  const selectTestForQr = async (test: TestRun) => {
    setSelectedTest(test);
    if (!test.assessmentToken) return;

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/assess/${test.assessmentToken}`;
    setAssessmentUrl(url);

    try {
      const qr = await QRCode.toDataURL(url, {
        width: 240,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
      });
      setQrCodeDataUrl(qr);
    } catch (err) {
      console.error('QR generation failed:', err);
    }
  };

  const handleCopy = () => {
    if (assessmentUrl) {
      navigator.clipboard.writeText(assessmentUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const checkTokenStatus = async () => {
    if (!selectedTest?.assessmentToken) return;
    setIsCheckingStatus(true);
    try {
      const res = await fetch(`/api/assessments/${selectedTest.assessmentToken}/status`);
      if (res.ok) {
        const data = await res.json();
        if (data.submitted && data.assessment) {
          const updatedTest: TestRun = {
            ...selectedTest,
            humanAssessment: data.assessment,
            assessmentStatus: 'Submitted',
          };
          await idbStorage.saveTestRun(updatedTest);
          setSelectedTest(updatedTest);
          setTests((prev) => prev.map((t) => (t.id === updatedTest.id ? updatedTest : t)));
        }
      }
    } catch (e) {
      console.error('Failed to check token status:', e);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full bg-black text-white space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <ClipboardCheck className="w-7 h-7 text-white" />
              <span>Independent Assessment Hub</span>
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-700 font-mono">
              Dual-Device Protocol
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
            Real-time sensory evaluation on a second device (smartphone) via QR code. Preserves experiment objectivity by isolating human assessors from live sensor readings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadTests}
            className="p-2 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white transition"
            title="Refresh tests list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/run-test"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Start New Test</span>
          </Link>
        </div>
      </div>

      {/* Protocol Explanation Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-white font-semibold">
            <Smartphone className="w-4 h-4 text-white" />
            <span>1. Scan QR Code</span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            The assessor scans the session QR code using their smartphone camera. No app installation or authentication required.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-white font-semibold">
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>2. Double-Blind Sensory Check</span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            The assessor inspects the physical cake sample (visual appearance and gentle smell waft) without observing BME688 sensor curves.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-white font-semibold">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>3. Instant Server Association</span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            The submission transmits over local Wi-Fi to the server API, immediately binding the sensory verdict to the sensor test report.
          </p>
        </div>
      </div>

      {/* Main Grid: QR Code Generator & Active Tests List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* QR Code Presentation Box */}
        <div className="lg:col-span-1 rounded-xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                <QrCode className="w-4 h-4 text-white" />
                Assessment Session QR
              </span>
              {selectedTest?.assessmentStatus === 'Submitted' || selectedTest?.assessmentStatus === 'submitted' ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-700">
                  <CheckCircle2 className="w-3 h-3" />
                  SUBMITTED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-700">
                  <Clock className="w-3 h-3" />
                  PENDING
                </span>
              )}
            </div>

            {selectedTest ? (
              <div className="space-y-4">
                <div className="p-3 bg-white rounded-xl w-fit mx-auto shadow-sm">
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt="Assessment Session QR Code"
                      className="w-48 h-48 object-contain"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-neutral-200 animate-pulse rounded" />
                  )}
                </div>

                <div className="text-center space-y-1">
                  <div className="font-bold text-sm text-white">{selectedTest.sampleId}</div>
                  <div className="text-xs text-neutral-400">
                    {selectedTest.cakeCategory} ({selectedTest.storageCondition})
                  </div>
                  <div className="text-[11px] font-mono text-neutral-500">{selectedTest.id}</div>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-mono text-neutral-400">Session URL:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={assessmentUrl}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 font-mono text-[11px] text-neutral-300 select-all"
                    />
                    <button
                      onClick={handleCopy}
                      className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-white font-medium transition shrink-0"
                    >
                      {isCopied ? 'Copied' : 'Copy'}
                    </button>
                    <a
                      href={assessmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition shrink-0"
                      title="Open in new window"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-neutral-500">
                Select a test run on the right to generate its assessment QR code.
              </div>
            )}
          </div>

          {selectedTest && (
            <div className="pt-4 border-t border-neutral-900 space-y-2">
              <button
                onClick={checkTokenStatus}
                disabled={isCheckingStatus}
                className="w-full py-2 px-3 rounded-lg bg-neutral-900 border border-neutral-700 text-xs font-semibold text-neutral-200 hover:bg-neutral-800 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                <span>Check Submission Status</span>
              </button>

              <Link
                href={`/results/${selectedTest.id}`}
                className="w-full py-2 px-3 rounded-lg bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition flex items-center justify-center gap-1.5"
              >
                <span>View Full Test Report</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Tests List & Assessment Status */}
        <div className="lg:col-span-2 rounded-xl border border-neutral-800 bg-neutral-950 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Active Experiment Assessment Queue</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Click any row to display its QR code for phone scanning.
              </p>
            </div>
            <span className="text-xs font-mono text-neutral-400">
              {
                tests.filter(
                  (t) => t.assessmentStatus === 'Submitted' || t.assessmentStatus === 'submitted'
                ).length
              }{' '}
              / {tests.length} Assessed
            </span>
          </div>

          {isLoading ? (
            <div className="text-center py-16 text-neutral-400 text-xs">
              <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-2" />
              Loading assessment sessions...
            </div>
          ) : tests.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-neutral-800 rounded-lg space-y-3">
              <Clock className="w-8 h-8 mx-auto text-neutral-600" />
              <h4 className="text-sm font-semibold text-neutral-300">No test runs recorded</h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Once you run a test, an assessment token and QR code will automatically be provisioned here.
              </p>
              <Link
                href="/run-test"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span>Run First Test</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 font-mono">
                    <th className="pb-3 font-medium">Sample / Test</th>
                    <th className="pb-3 font-medium">Category</th>
                    <th className="pb-3 font-medium">Condition</th>
                    <th className="pb-3 font-medium">Started</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">QR / Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900">
                  {tests.map((t) => {
                    const isCurrent = selectedTest?.id === t.id;
                    const isSubmitted =
                      t.assessmentStatus === 'Submitted' || t.assessmentStatus === 'submitted';

                    return (
                      <tr
                        key={t.id}
                        onClick={() => selectTestForQr(t)}
                        className={`cursor-pointer transition ${
                          isCurrent
                            ? 'bg-neutral-900/80'
                            : 'hover:bg-neutral-900/30'
                        }`}
                      >
                        <td className="py-3 pr-2">
                          <div className="font-semibold text-white">{t.sampleId}</div>
                          <div className="font-mono text-[10px] text-neutral-500">{t.id}</div>
                        </td>

                        <td className="py-3 text-neutral-300">{t.cakeCategory}</td>

                        <td className="py-3 text-neutral-300 capitalize">
                          {t.storageCondition}
                        </td>

                        <td className="py-3 text-neutral-400 font-mono text-[11px]">
                          {formatDate(t.startedAt)}
                        </td>

                        <td className="py-3">
                          {isSubmitted ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              Submitted
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-amber-300 border border-amber-800/60">
                              <Clock className="w-3 h-3" />
                              Pending
                            </span>
                          )}
                        </td>

                        <td className="py-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              selectTestForQr(t);
                            }}
                            className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition"
                            title="Show QR Code"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Detailed View of Selected Assessment if Submitted */}
          {selectedTest?.humanAssessment && (
            <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-3 mt-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className="text-xs font-mono uppercase text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Sensory Assessment Record: {selectedTest.sampleId}
                </span>
                <span className="font-mono text-[11px] text-neutral-400">
                  Assessor: {selectedTest.humanAssessment.assessorIdentifier || 'Anonymous'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-neutral-500 font-mono text-[10px] block">VISUAL</span>
                  <span className="font-semibold text-white capitalize">
                    {selectedTest.humanAssessment.visualCondition}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 font-mono text-[10px] block">SMELL</span>
                  <span className="font-semibold text-white capitalize">
                    {selectedTest.humanAssessment.smellAssessment}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 font-mono text-[10px] block">VERDICT</span>
                  <span className="font-semibold text-white capitalize">
                    {selectedTest.humanAssessment.humanAssessment}
                  </span>
                </div>
              </div>

              {selectedTest.humanAssessment.observations && (
                <div className="text-xs text-neutral-400 border-t border-neutral-800 pt-2">
                  <span className="text-neutral-500 font-medium">Notes: </span>
                  {selectedTest.humanAssessment.observations}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

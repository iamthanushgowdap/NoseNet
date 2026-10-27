'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/app-context';
import { DemoRole } from '@/types/auth';
import { Button } from '@/components/common/button';
import { Shield, FlaskConical, ClipboardCheck, Info, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const { session, login } = useApp();

  const [displayName, setDisplayName] = useState(session?.displayName || 'Lead Researcher');
  const [role, setRole] = useState<DemoRole>(session?.role || 'researcher');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Please provide a display name');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      await login(displayName.trim(), role);
      if (role === 'assessor') {
        router.push('/assess');
      } else {
        router.push('/');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to save session');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black text-white">
      <div className="w-full max-w-md bg-black border border-neutral-800 rounded-xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-800">
          <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Demonstration Sign-In</h2>
            <p className="text-xs text-neutral-300">Select role and enter your research display name</p>
          </div>
        </div>

        {/* Local-only disclaimer */}
        <div className="mb-6 p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-white shrink-0 mt-0.5" />
          <div>
            <strong className="text-white">Local Browser Session:</strong> Authentication is simulated for
            development and demonstration. All credentials and sessions persist in localStorage.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-md bg-rose-950 border border-rose-600 text-white text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Dr. Nair or Assessor 1"
              required
              className="w-full px-3.5 py-2.5 rounded-md bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:border-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2">
              Select Demo Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Researcher role card */}
              <button
                type="button"
                onClick={() => setRole('researcher')}
                className={cn(
                  'relative p-4 rounded-lg border text-left transition-all flex flex-col justify-between',
                  role === 'researcher'
                    ? 'bg-neutral-900 border-white text-white shadow-sm'
                    : 'bg-black border-neutral-800 text-neutral-400 hover:border-neutral-700'
                )}
              >
                {role === 'researcher' && (
                  <CheckCircle2 className="w-4 h-4 text-white absolute top-2.5 right-2.5" />
                )}
                <FlaskConical className="w-5 h-5 text-white mb-2" />
                <div>
                  <h4 className="text-sm font-bold text-white">Researcher</h4>
                  <p className="text-[11px] text-neutral-300 mt-1 leading-snug">
                    Full control: experiments, samples, CSV import, sensor graphs, exports.
                  </p>
                </div>
              </button>

              {/* Assessor role card */}
              <button
                type="button"
                onClick={() => setRole('assessor')}
                className={cn(
                  'relative p-4 rounded-lg border text-left transition-all flex flex-col justify-between',
                  role === 'assessor'
                    ? 'bg-neutral-900 border-white text-white shadow-sm'
                    : 'bg-black border-neutral-800 text-neutral-400 hover:border-neutral-700'
                )}
              >
                {role === 'assessor' && (
                  <CheckCircle2 className="w-4 h-4 text-white absolute top-2.5 right-2.5" />
                )}
                <ClipboardCheck className="w-5 h-5 text-white mb-2" />
                <div>
                  <h4 className="text-sm font-bold text-white">Assessor</h4>
                  <p className="text-[11px] text-neutral-300 mt-1 leading-snug">
                    Sensory testing: view local samples, evaluate Fresh/Average/Not Good.
                  </p>
                </div>
              </button>
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full mt-4" isLoading={isLoading}>
            Continue as {role === 'researcher' ? 'Researcher' : 'Assessor'}
          </Button>
        </form>
      </div>
    </div>
  );
}

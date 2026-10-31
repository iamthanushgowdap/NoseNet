// Dedicated Supabase PostgreSQL Database Adapter for NoseNet
import { CakeType, FreshnessVerdict, LiveTestState } from '@/lib/server/live-test-store';

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vmgfolcjthkxnisvadzu.supabase.co';

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtZ2ZvbGNqdGhreG5pc3ZhZHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MDM1MjYsImV4cCI6MjA5NjA3OTUyNn0.hCDmE9rTvcEw2l54cIzNa-pivcD9Qp-ISUEtc7o0Tc4';

const HEADERS = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

// 1. Fetch current live test state from Supabase
export async function getSupabaseLiveState(): Promise<LiveTestState | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/nosenet_live_state?id=eq.live_test&select=*`, {
      headers: { ...HEADERS, 'Cache-Control': 'no-cache' },
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const rows = await res.json();
    if (rows && rows.length > 0) {
      const row = rows[0];
      return {
        isTestRunning: Boolean(row.is_test_running),
        selectedCakeType: (row.selected_cake_type as CakeType) || 'Normal Cake — Unfrozen',
        startedAt: row.started_at || null,
        testId: row.test_id || null,
        lastSensorReading: null,
        sensorReadingsCount: 0,
        verdict: (row.verdict as FreshnessVerdict) || null,
        freshnessScore: row.freshness_score !== null && row.freshness_score !== undefined ? Number(row.freshness_score) : null,
        verdictSubmittedAt: row.verdict_submitted_at || null,
        assessorName: row.assessor_name || null,
      };
    }
  } catch {}
  return null;
}

// 2. Update live test state in Supabase (Station starts test, switches cake, or assessor submits verdict)
export async function updateSupabaseLiveState(fields: {
  is_test_running?: boolean;
  selected_cake_type?: string | null;
  started_at?: string | null;
  test_id?: string | null;
  verdict?: string | null;
  freshness_score?: number | null;
  verdict_submitted_at?: string | null;
  assessor_name?: string | null;
}): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/nosenet_live_state?id=eq.live_test`, {
      method: 'PATCH',
      headers: HEADERS,
      body: JSON.stringify({
        ...fields,
        updated_at: new Date().toISOString(),
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

// 3. Permanently archive completed test to Supabase PostgreSQL table
export async function insertSupabaseTestRecord(data: {
  testId: string;
  cakeType: string;
  verdict: string;
  freshnessScore: number;
  assessorName?: string;
}): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/nosenet_test_history`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({
        test_id: data.testId,
        cake_type: data.cakeType,
        verdict: data.verdict,
        freshness_score: data.freshnessScore,
        assessor_name: data.assessorName || 'Phone Assessor',
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

// Ultra-fast dual-channel direct cloud sync for remote phone assessor & station synchronization
export const CLOUD_SYNC_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a18f237fcd6a39';

export interface CloudLiveState {
  isTestRunning: boolean;
  selectedCakeType?: string | null;
  startedAt?: string | null;
  testId?: string | null;
  verdict?: 'Fresh' | 'Fairly Fresh' | 'Stale' | 'Spoiled' | 'Not Fresh' | null;
  freshnessScore?: number | null;
  verdictSubmittedAt?: string | null;
  assessorName?: string | null;
}

export async function directCloudPush(data: Partial<CloudLiveState>): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(CLOUD_SYNC_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'NoseNet_State',
        data,
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

export async function directCloudFetch(): Promise<CloudLiveState | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`${CLOUD_SYNC_URL}?_t=${Date.now()}`, {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' },
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const json = await res.json();
    if (json && json.data && typeof json.data === 'object') {
      return json.data as CloudLiveState;
    }
  } catch {}
  return null;
}
